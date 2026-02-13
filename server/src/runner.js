// Kubernetes Job runner for exekute.
// Creates short-lived Jobs, waits for completion, reads logs, cleans up.

const { execSync, exec } = require('child_process');
const crypto = require('crypto');

const NAMESPACE = process.env.EXEKUTE_NAMESPACE || 'exekute';
const REGISTRY = process.env.EXEKUTE_REGISTRY || 'registry.nstsdc.org:5000';

function generateJobName() {
  const id = crypto.randomBytes(4).toString('hex');
  return `exekute-run-${id}`;
}

function buildJobManifest(jobName, language, code, timeoutSeconds) {
  const filename = language.filename || `main.${language.extension}`;
  const image = `${REGISTRY}/${language.image}:latest`;

  // Base64 encode the code to avoid shell escaping issues.
  const codeB64 = Buffer.from(code).toString('base64');

  return {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      name: jobName,
      namespace: NAMESPACE,
      labels: {
        app: 'exekute',
        type: 'execution',
      },
    },
    spec: {
      ttlSecondsAfterFinished: 30,
      backoffLimit: 0,
      activeDeadlineSeconds: timeoutSeconds,
      template: {
        metadata: {
          labels: {
            app: 'exekute',
            type: 'execution',
          },
        },
        spec: {
          restartPolicy: 'Never',
          automountServiceAccountToken: false,
          enableServiceLinks: false,
          containers: [
            {
              name: 'runner',
              image: image,
              command: ['sh', '-c', [
                `echo "${codeB64}" | base64 -d > /code/${filename}`,
                language.command.join(' '),
              ].join(' && ')],
              resources: {
                limits: {
                  cpu: '500m',
                  memory: '256Mi',
                },
                requests: {
                  cpu: '100m',
                  memory: '64Mi',
                },
              },
              securityContext: {
                runAsNonRoot: true,
                runAsUser: 1000,
                readOnlyRootFilesystem: false,
                allowPrivilegeEscalation: false,
              },
              volumeMounts: [
                {
                  name: 'code',
                  mountPath: '/code',
                },
              ],
            },
          ],
          volumes: [
            {
              name: 'code',
              emptyDir: {
                sizeLimit: '10Mi',
              },
            },
          ],
          securityContext: {
            seccompProfile: {
              type: 'RuntimeDefault',
            },
          },
        },
      },
    },
  };
}

function kubectl(args, options = {}) {
  const cmd = `kubectl ${args}`;
  return execSync(cmd, {
    encoding: 'utf-8',
    timeout: 70000,
    ...options,
  });
}

function kubectlAsync(args) {
  return new Promise((resolve, reject) => {
    exec(`kubectl ${args}`, { encoding: 'utf-8', timeout: 70000 }, (err, stdout, stderr) => {
      if (err) {
        reject(new Error(stderr || err.message));
      } else {
        resolve(stdout);
      }
    });
  });
}

async function runCode(language, code, timeoutSeconds) {
  const jobName = generateJobName();
  const manifest = buildJobManifest(jobName, language, code, timeoutSeconds);

  try {
    // Create the job.
    const manifestJson = JSON.stringify(manifest);
    execSync(`echo '${manifestJson.replace(/'/g, "'\\''")}' | kubectl apply -f -`, {
      encoding: 'utf-8',
      timeout: 10000,
    });

    // Wait for the job to complete.
    const waitResult = await waitForJob(jobName, timeoutSeconds);

    // Get the logs.
    let output = '';
    try {
      output = await kubectlAsync(
        `-n ${NAMESPACE} logs job/${jobName} --tail=1000`
      );
    } catch (e) {
      output = waitResult.timedOut ? '[execution timed out]' : '[no output]';
    }

    return {
      output: output.slice(0, 50000),
      exitCode: waitResult.exitCode,
      timedOut: waitResult.timedOut,
    };
  } finally {
    // Clean up the job (best effort).
    try {
      execSync(
        `kubectl -n ${NAMESPACE} delete job ${jobName} --ignore-not-found=true`,
        { encoding: 'utf-8', timeout: 10000 }
      );
    } catch (e) {
      // Ignore cleanup errors.
    }
  }
}

async function waitForJob(jobName, timeoutSeconds) {
  const deadline = Date.now() + (timeoutSeconds + 5) * 1000;
  const pollInterval = 500;

  while (Date.now() < deadline) {
    try {
      const status = await kubectlAsync(
        `-n ${NAMESPACE} get job ${jobName} -o jsonpath='{.status}'`
      );
      const parsed = JSON.parse(status.replace(/^'|'$/g, ''));

      if (parsed.succeeded && parsed.succeeded > 0) {
        return { exitCode: 0, timedOut: false };
      }

      if (parsed.failed && parsed.failed > 0) {
        // Check if it was a timeout (activeDeadlineSeconds).
        const conditions = parsed.conditions || [];
        const deadlineExceeded = conditions.some(
          (c) => c.type === 'Failed' && c.reason === 'DeadlineExceeded'
        );
        return { exitCode: 1, timedOut: deadlineExceeded };
      }
    } catch (e) {
      // Job might not have status yet, keep polling.
    }

    await new Promise((r) => setTimeout(r, pollInterval));
  }

  return { exitCode: 1, timedOut: true };
}

module.exports = { runCode };

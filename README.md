# exekute

A lightweight code execution engine for educational use. Runs student code in sandboxed, short-lived Kubernetes Jobs.

## Structure

```txt
exekute/
  client/     -- Vue 3 frontend with Monaco editor
  server/     -- Express API that creates K8s Jobs
  docker/     -- Dockerfiles for language runtimes
  scripts/    -- Cluster setup and deployment helpers
```

## Supported Languages

- JavaScript (Node.js)
- Python 3
- Java
- C
- C++

## Requirements

- Node.js 20+
- A Kubernetes cluster with kubectl access
- Container images pre-pulled or a local registry

## Development

```bash
# server
cd server && npm install && npm run dev

# client
cd client && npm install && npm run dev
```

## Deployment

See `scripts/` for registry setup, image build, and systemd service files.

#!/bin/bash
# setup-registry.sh
# Sets up a local container registry on the K8s cluster.
# Run this on nst-n1.

set -e

REGISTRY_PORT=5000
REGISTRY_NAME="registry"
NAMESPACE="exekute"

echo "-- Creating namespace: ${NAMESPACE}"
kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -

echo "-- Deploying local registry"
cat <<EOF | kubectl apply -f -
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${REGISTRY_NAME}
  namespace: ${NAMESPACE}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: registry
  template:
    metadata:
      labels:
        app: registry
    spec:
      containers:
      - name: registry
        image: registry:2
        ports:
        - containerPort: ${REGISTRY_PORT}
        volumeMounts:
        - name: data
          mountPath: /var/lib/registry
        resources:
          limits:
            memory: 256Mi
            cpu: 200m
      volumes:
      - name: data
        emptyDir: {}
---
apiVersion: v1
kind: Service
metadata:
  name: ${REGISTRY_NAME}
  namespace: ${NAMESPACE}
spec:
  type: NodePort
  ports:
  - port: ${REGISTRY_PORT}
    targetPort: ${REGISTRY_PORT}
    nodePort: 30500
  selector:
    app: registry
EOF

echo "-- Waiting for registry to be ready"
kubectl -n ${NAMESPACE} rollout status deployment/${REGISTRY_NAME} --timeout=60s

echo ""
echo "Registry is running."
echo "From cluster nodes, push to: localhost:30500"
echo ""
echo "-- Configuring containerd to allow insecure registry"
echo "Run the following on EACH node (nst-n1 through nst-n5):"
echo ""
echo '  sudo mkdir -p /etc/rancher/k3s'
echo '  cat <<INNER | sudo tee /etc/rancher/k3s/registries.yaml'
echo '  mirrors:'
echo '    "registry.nstsdc.org:5000":'
echo '      endpoint:'
echo '        - "http://192.168.136.145:30500"'
echo '  INNER'
echo '  sudo systemctl restart k3s  # on nst-n1'
echo '  sudo systemctl restart k3s-agent  # on workers'
echo ""
echo "After configuring registries on all nodes, run: ./build-images.sh"

#!/bin/bash
# build-images.sh
# Builds and pushes runtime images to the local registry.
# Run this on nst-n1.

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCKER_DIR="${SCRIPT_DIR}/../docker"
REGISTRY="localhost:30500"

declare -A IMAGES
IMAGES[node]="exekute-node"
IMAGES[python]="exekute-python"
IMAGES[java]="exekute-java"
IMAGES[gcc]="exekute-gcc"

for dir in "${!IMAGES[@]}"; do
  name="${IMAGES[$dir]}"
  echo "-- Building ${name} from docker/${dir}"
  docker build -t "${REGISTRY}/${name}:latest" "${DOCKER_DIR}/${dir}"
  echo "-- Pushing ${name}"
  docker push "${REGISTRY}/${name}:latest"
  echo ""
done

echo "All images built and pushed."
echo ""
echo "Verify with: curl http://localhost:30500/v2/_catalog"

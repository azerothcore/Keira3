#!/bin/bash

# Keira3 Docker Build Script
# Builds Docker image with proper tagging and validation

set -euo pipefail

# Configuration
IMAGE_NAME="${IMAGE_NAME:-keira3}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
BUILD_CONTEXT="${BUILD_CONTEXT:-.}"
DOCKERFILE_PATH="${DOCKERFILE_PATH:-docker/Dockerfile}"
PLATFORM="${PLATFORM:-linux/amd64,linux/arm64}"
PUSH="${PUSH:-false}"
REGISTRY="${REGISTRY:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Print usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Build Keira3 Docker image with proper validation and tagging"
    echo ""
    echo "Options:"
    echo "  -n, --name NAME       Image name (default: keira3)"
    echo "  -t, --tag TAG         Image tag (default: latest)"
    echo "  -c, --context PATH    Build context path (default: .)"
    echo "  -f, --file PATH       Dockerfile path (default: docker/Dockerfile)"
    echo "  -p, --platform ARCH   Target platform (default: linux/amd64,linux/arm64)"
    echo "  -r, --registry URL    Container registry URL"
    echo "      --push            Push image to registry"
    echo "      --no-cache        Build without cache"
    echo "      --test            Run container tests after build"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  IMAGE_NAME            Override image name"
    echo "  IMAGE_TAG             Override image tag"
    echo "  BUILD_CONTEXT         Override build context"
    echo "  DOCKERFILE_PATH       Override Dockerfile path"
    echo "  PLATFORM              Override target platform"
    echo "  REGISTRY              Override registry URL"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Build with defaults"
    echo "  $0 -t v1.0.0 --push                 # Build and push v1.0.0"
    echo "  $0 -r ghcr.io/user/repo --push      # Build and push to GitHub Container Registry"
    echo "  $0 --test                            # Build and run tests"
}

# Parse command line arguments
NO_CACHE=""
RUN_TESTS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -c|--context)
            BUILD_CONTEXT="$2"
            shift 2
            ;;
        -f|--file)
            DOCKERFILE_PATH="$2"
            shift 2
            ;;
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -r|--registry)
            REGISTRY="$2"
            shift 2
            ;;
        --push)
            PUSH="true"
            shift
            ;;
        --no-cache)
            NO_CACHE="--no-cache"
            shift
            ;;
        --test)
            RUN_TESTS="true"
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Construct full image name
if [[ -n "$REGISTRY" ]]; then
    FULL_IMAGE_NAME="${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
else
    FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"
fi

# Validation
log_info "Validating build environment..."

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed or not in PATH"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    log_error "Docker daemon is not running"
    exit 1
fi

# Check if Dockerfile exists
if [[ ! -f "$DOCKERFILE_PATH" ]]; then
    log_error "Dockerfile not found at: $DOCKERFILE_PATH"
    exit 1
fi

# Check if build context exists
if [[ ! -d "$BUILD_CONTEXT" ]]; then
    log_error "Build context directory not found: $BUILD_CONTEXT"
    exit 1
fi

# Check for required files in build context
REQUIRED_FILES=("package.json" "angular.json")
for file in "${REQUIRED_FILES[@]}"; do
    if [[ ! -f "$BUILD_CONTEXT/$file" ]]; then
        log_error "Required file not found in build context: $file"
        exit 1
    fi
done

log_success "Build environment validation passed"

# Print build information
log_info "Build Configuration:"
echo "  Image Name: $FULL_IMAGE_NAME"
echo "  Build Context: $BUILD_CONTEXT"
echo "  Dockerfile: $DOCKERFILE_PATH"
echo "  Platform: $PLATFORM"
echo "  Push: $PUSH"
echo "  No Cache: ${NO_CACHE:-false}"
echo "  Run Tests: ${RUN_TESTS:-false}"

# Setup Docker Buildx if needed for multi-platform builds
if [[ "$PLATFORM" == *","* ]]; then
    log_info "Setting up Docker Buildx for multi-platform build..."
    docker buildx create --use --name keira3-builder 2>/dev/null || true
    docker buildx inspect --bootstrap
fi

# Build the image
log_info "Building Docker image..."

BUILD_ARGS=""
if [[ "$PUSH" == "true" && "$PLATFORM" == *","* ]]; then
    # Multi-platform build with push
    docker buildx build \
        --platform "$PLATFORM" \
        --file "$DOCKERFILE_PATH" \
        --tag "$FULL_IMAGE_NAME" \
        --push \
        $NO_CACHE \
        "$BUILD_CONTEXT"
else
    # Single platform build or local build
    docker build \
        --file "$DOCKERFILE_PATH" \
        --tag "$FULL_IMAGE_NAME" \
        $NO_CACHE \
        "$BUILD_CONTEXT"
fi

log_success "Docker image built successfully: $FULL_IMAGE_NAME"

# Get image size and details
IMAGE_SIZE=$(docker images --format "table {{.Size}}" "$FULL_IMAGE_NAME" | tail -n +2)
log_info "Image size: $IMAGE_SIZE"

# Run tests if requested
if [[ "$RUN_TESTS" == "true" ]]; then
    log_info "Running container tests..."

    # Start test container
    CONTAINER_NAME="keira3-test-$(date +%s)"

    docker run -d \
        --name "$CONTAINER_NAME" \
        -e KEIRA_DATABASE_HOST=localhost \
        -e KEIRA_DATABASE_USER=test \
        -e KEIRA_DATABASE_PASSWORD=test \
        -e KEIRA_DATABASE_NAME=test \
        -p 8080:8080 \
        -p 3001:3001 \
        "$FULL_IMAGE_NAME"

    # Wait for container to start
    log_info "Waiting for container to start..."
    sleep 10

    # Test health endpoints
    if curl -f http://localhost:8080/health &>/dev/null; then
        log_success "Web health check passed"
    else
        log_error "Web health check failed"
        docker logs "$CONTAINER_NAME"
        docker stop "$CONTAINER_NAME"
        docker rm "$CONTAINER_NAME"
        exit 1
    fi

    if curl -f http://localhost:3001/health &>/dev/null; then
        log_success "API health check passed"
    else
        log_error "API health check failed"
        docker logs "$CONTAINER_NAME"
        docker stop "$CONTAINER_NAME"
        docker rm "$CONTAINER_NAME"
        exit 1
    fi

    # Cleanup test container
    docker stop "$CONTAINER_NAME"
    docker rm "$CONTAINER_NAME"

    log_success "All container tests passed"
fi

# Push image if requested (for single platform builds)
if [[ "$PUSH" == "true" && "$PLATFORM" != *","* ]]; then
    log_info "Pushing image to registry..."
    docker push "$FULL_IMAGE_NAME"
    log_success "Image pushed successfully"
fi

# Cleanup
if [[ "$PLATFORM" == *","* ]]; then
    log_info "Cleaning up Buildx builder..."
    docker buildx rm keira3-builder 2>/dev/null || true
fi

log_success "Build completed successfully!"
echo ""
echo "Image: $FULL_IMAGE_NAME"
echo "Size: $IMAGE_SIZE"

# Print usage instructions
echo ""
echo "Usage instructions:"
echo "  docker run -d \\"
echo "    --name keira3 \\"
echo "    -e KEIRA_DATABASE_HOST=your-mysql-host \\"
echo "    -e KEIRA_DATABASE_USER=your-username \\"
echo "    -e KEIRA_DATABASE_PASSWORD=your-password \\"
echo "    -e KEIRA_DATABASE_NAME=acore_world \\"
echo "    -p 8080:8080 \\"
echo "    $FULL_IMAGE_NAME"
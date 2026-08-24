#!/bin/bash

# Keira3 Docker Deployment Script
# Handles deployment to different environments with proper validation

set -euo pipefail

# Configuration
ENVIRONMENT="${ENVIRONMENT:-development}"
IMAGE_NAME="${IMAGE_NAME:-keira3}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
COMPOSE_FILE="${COMPOSE_FILE:-docker/config/docker-compose.example.yml}"
ENV_FILE="${ENV_FILE:-docker/.env}"
SERVICE_NAME="${SERVICE_NAME:-keira3}"

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
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Deploy Keira3 Docker container to various environments"
    echo ""
    echo "Commands:"
    echo "  deploy                Deploy the application"
    echo "  update                Update existing deployment"
    echo "  rollback              Rollback to previous version"
    echo "  status                Check deployment status"
    echo "  logs                  Show application logs"
    echo "  stop                  Stop the application"
    echo "  restart               Restart the application"
    echo "  health                Check application health"
    echo ""
    echo "Options:"
    echo "  -e, --env ENV         Target environment (development|staging|production)"
    echo "  -i, --image IMAGE     Docker image name (default: keira3)"
    echo "  -t, --tag TAG         Image tag (default: latest)"
    echo "  -f, --file FILE       Docker Compose file path"
    echo "      --env-file FILE   Environment file path"
    echo "  -s, --service NAME    Service name (default: keira3)"
    echo "      --dry-run         Show what would be done without executing"
    echo "      --force           Force deployment without confirmation"
    echo "  -h, --help            Show this help message"
    echo ""
    echo "Environment Variables:"
    echo "  ENVIRONMENT           Target environment"
    echo "  IMAGE_NAME            Docker image name"
    echo "  IMAGE_TAG             Image tag"
    echo "  COMPOSE_FILE          Docker Compose file path"
    echo "  ENV_FILE              Environment file path"
    echo ""
    echo "Examples:"
    echo "  $0 deploy -e staging                    # Deploy to staging"
    echo "  $0 update -t v1.0.1                    # Update to version 1.0.1"
    echo "  $0 rollback                             # Rollback deployment"
    echo "  $0 status                               # Check status"
}

# Parse command line arguments
COMMAND=""
DRY_RUN=""
FORCE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        deploy|update|rollback|status|logs|stop|restart|health)
            if [[ -z "$COMMAND" ]]; then
                COMMAND="$1"
            else
                log_error "Multiple commands specified"
                exit 1
            fi
            shift
            ;;
        -e|--env)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -i|--image)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -t|--tag)
            IMAGE_TAG="$2"
            shift 2
            ;;
        -f|--file)
            COMPOSE_FILE="$2"
            shift 2
            ;;
        --env-file)
            ENV_FILE="$2"
            shift 2
            ;;
        -s|--service)
            SERVICE_NAME="$2"
            shift 2
            ;;
        --dry-run)
            DRY_RUN="true"
            shift
            ;;
        --force)
            FORCE="true"
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

# Default command
if [[ -z "$COMMAND" ]]; then
    COMMAND="deploy"
fi

# Validate environment
case "$ENVIRONMENT" in
    development|dev)
        ENVIRONMENT="development"
        ;;
    staging|stage)
        ENVIRONMENT="staging"
        ;;
    production|prod)
        ENVIRONMENT="production"
        ;;
    *)
        log_error "Invalid environment: $ENVIRONMENT"
        log_error "Valid environments: development, staging, production"
        exit 1
        ;;
esac

# Construct full image name
FULL_IMAGE_NAME="${IMAGE_NAME}:${IMAGE_TAG}"

# Validation functions
validate_requirements() {
    log_info "Validating deployment requirements..."

    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi

    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed or not in PATH"
        exit 1
    fi

    # Check if Docker is running
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        exit 1
    fi

    log_success "Requirements validation passed"
}

validate_files() {
    log_info "Validating configuration files..."

    # Check if Compose file exists
    if [[ ! -f "$COMPOSE_FILE" ]]; then
        log_error "Docker Compose file not found: $COMPOSE_FILE"
        exit 1
    fi

    # Check if environment file exists
    if [[ ! -f "$ENV_FILE" ]]; then
        log_warning "Environment file not found: $ENV_FILE"
        log_warning "Using environment variables from shell"
    fi

    # Validate Compose file syntax
    if ! docker-compose -f "$COMPOSE_FILE" config &> /dev/null; then
        log_error "Invalid Docker Compose file syntax"
        exit 1
    fi

    log_success "File validation passed"
}

validate_environment_config() {
    log_info "Validating environment configuration..."

    # Load environment file if it exists
    if [[ -f "$ENV_FILE" ]]; then
        set -a
        source "$ENV_FILE"
        set +a
    fi

    # Check required environment variables
    REQUIRED_VARS=(
        "KEIRA_DATABASE_HOST"
        "KEIRA_DATABASE_USER"
        "KEIRA_DATABASE_PASSWORD"
        "KEIRA_DATABASE_NAME"
    )

    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log_error "Required environment variable not set: $var"
            exit 1
        fi
    done

    # Environment-specific validation
    case "$ENVIRONMENT" in
        production)
            if [[ "${NODE_ENV:-}" != "production" ]]; then
                log_warning "NODE_ENV should be 'production' for production deployment"
            fi
            ;;
        staging)
            if [[ "${NODE_ENV:-}" != "staging" && "${NODE_ENV:-}" != "production" ]]; then
                log_warning "NODE_ENV should be 'staging' or 'production' for staging deployment"
            fi
            ;;
    esac

    log_success "Environment configuration validation passed"
}

# Deployment functions
check_image() {
    log_info "Checking Docker image availability..."

    if docker image inspect "$FULL_IMAGE_NAME" &> /dev/null; then
        log_success "Image found locally: $FULL_IMAGE_NAME"
    else
        log_info "Pulling image: $FULL_IMAGE_NAME"
        if ! docker pull "$FULL_IMAGE_NAME"; then
            log_error "Failed to pull image: $FULL_IMAGE_NAME"
            exit 1
        fi
        log_success "Image pulled successfully"
    fi
}

backup_current_deployment() {
    if docker-compose -f "$COMPOSE_FILE" ps "$SERVICE_NAME" &> /dev/null; then
        log_info "Creating backup of current deployment..."

        # Save current image tag
        CURRENT_IMAGE=$(docker-compose -f "$COMPOSE_FILE" config | grep "image:" | head -1 | awk '{print $2}')
        echo "$CURRENT_IMAGE" > ".last_deployed_image"

        log_success "Backup created"
    fi
}

deploy_application() {
    log_info "Deploying Keira3 to $ENVIRONMENT environment..."

    # Set image in compose file
    export KEIRA_IMAGE="$FULL_IMAGE_NAME"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN - Would execute:"
        echo "  docker-compose -f $COMPOSE_FILE up -d $SERVICE_NAME"
        return
    fi

    # Deploy using Docker Compose
    if [[ -f "$ENV_FILE" ]]; then
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d "$SERVICE_NAME"
    else
        docker-compose -f "$COMPOSE_FILE" up -d "$SERVICE_NAME"
    fi

    log_success "Deployment completed"
}

wait_for_health() {
    log_info "Waiting for application to become healthy..."

    local max_attempts=30
    local attempt=1

    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose -f "$COMPOSE_FILE" exec -T "$SERVICE_NAME" curl -f http://localhost:8080/health &> /dev/null; then
            log_success "Application is healthy"
            return 0
        fi

        if [[ $attempt -eq $max_attempts ]]; then
            log_error "Application failed to become healthy after $max_attempts attempts"
            return 1
        fi

        log_info "Attempt $attempt/$max_attempts - waiting..."
        sleep 10
        ((attempt++))
    done
}

# Command implementations
cmd_deploy() {
    validate_requirements
    validate_files
    validate_environment_config

    if [[ "$ENVIRONMENT" == "production" && "$FORCE" != "true" ]]; then
        log_warning "Deploying to PRODUCTION environment"
        read -p "Are you sure you want to continue? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled"
            exit 0
        fi
    fi

    check_image
    backup_current_deployment
    deploy_application
    wait_for_health

    log_success "Deployment to $ENVIRONMENT completed successfully!"
}

cmd_update() {
    log_info "Updating deployment to $FULL_IMAGE_NAME..."
    cmd_deploy
}

cmd_rollback() {
    if [[ ! -f ".last_deployed_image" ]]; then
        log_error "No previous deployment found to rollback to"
        exit 1
    fi

    ROLLBACK_IMAGE=$(cat ".last_deployed_image")
    log_info "Rolling back to previous image: $ROLLBACK_IMAGE"

    export KEIRA_IMAGE="$ROLLBACK_IMAGE"

    if [[ "$DRY_RUN" == "true" ]]; then
        log_info "DRY RUN - Would rollback to: $ROLLBACK_IMAGE"
        return
    fi

    if [[ -f "$ENV_FILE" ]]; then
        docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d "$SERVICE_NAME"
    else
        docker-compose -f "$COMPOSE_FILE" up -d "$SERVICE_NAME"
    fi

    wait_for_health
    log_success "Rollback completed successfully"
}

cmd_status() {
    log_info "Checking deployment status..."

    if docker-compose -f "$COMPOSE_FILE" ps "$SERVICE_NAME" &> /dev/null; then
        docker-compose -f "$COMPOSE_FILE" ps "$SERVICE_NAME"

        # Show resource usage
        CONTAINER_ID=$(docker-compose -f "$COMPOSE_FILE" ps -q "$SERVICE_NAME")
        if [[ -n "$CONTAINER_ID" ]]; then
            echo ""
            log_info "Resource usage:"
            docker stats --no-stream "$CONTAINER_ID"
        fi
    else
        log_warning "Service not found or not running"
    fi
}

cmd_logs() {
    log_info "Showing application logs..."
    docker-compose -f "$COMPOSE_FILE" logs -f "$SERVICE_NAME"
}

cmd_stop() {
    log_info "Stopping application..."
    docker-compose -f "$COMPOSE_FILE" stop "$SERVICE_NAME"
    log_success "Application stopped"
}

cmd_restart() {
    log_info "Restarting application..."
    docker-compose -f "$COMPOSE_FILE" restart "$SERVICE_NAME"
    wait_for_health
    log_success "Application restarted"
}

cmd_health() {
    log_info "Checking application health..."

    # Check container status
    if ! docker-compose -f "$COMPOSE_FILE" ps "$SERVICE_NAME" | grep -q "Up"; then
        log_error "Service is not running"
        exit 1
    fi

    # Check health endpoints
    if docker-compose -f "$COMPOSE_FILE" exec -T "$SERVICE_NAME" curl -f http://localhost:8080/health &> /dev/null; then
        log_success "Web interface is healthy"
    else
        log_error "Web interface health check failed"
        exit 1
    fi

    if docker-compose -f "$COMPOSE_FILE" exec -T "$SERVICE_NAME" curl -f http://localhost:3001/health &> /dev/null; then
        log_success "API service is healthy"
    else
        log_error "API service health check failed"
        exit 1
    fi

    log_success "All health checks passed"
}

# Main execution
log_info "Keira3 Deployment Script"
log_info "Environment: $ENVIRONMENT"
log_info "Image: $FULL_IMAGE_NAME"
log_info "Command: $COMMAND"

case "$COMMAND" in
    deploy)
        cmd_deploy
        ;;
    update)
        cmd_update
        ;;
    rollback)
        cmd_rollback
        ;;
    status)
        cmd_status
        ;;
    logs)
        cmd_logs
        ;;
    stop)
        cmd_stop
        ;;
    restart)
        cmd_restart
        ;;
    health)
        cmd_health
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        usage
        exit 1
        ;;
esac
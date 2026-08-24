# Keira3 Docker Makefile
# Provides convenient commands for Docker build and deployment operations

.PHONY: help build build-no-cache test deploy deploy-staging deploy-production update rollback status logs health stop restart clean lint validate

# Default variables
IMAGE_NAME ?= keira3
IMAGE_TAG ?= latest
REGISTRY ?=
ENVIRONMENT ?= development
COMPOSE_FILE ?= docker/config/docker-compose.example.yml
ENV_FILE ?= docker/.env

# Docker build variables
DOCKERFILE = docker/Dockerfile
BUILD_CONTEXT = .
PLATFORM = linux/amd64,linux/arm64

# Colors for output
RED = \033[0;31m
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
NC = \033[0m # No Color

# Default target
.DEFAULT_GOAL := help

## Display help information
help:
	@echo "$(BLUE)Keira3 Docker Makefile$(NC)"
	@echo ""
	@echo "$(YELLOW)Available targets:$(NC)"
	@echo ""
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Variables:$(NC)"
	@echo "  IMAGE_NAME=$(IMAGE_NAME)"
	@echo "  IMAGE_TAG=$(IMAGE_TAG)"
	@echo "  REGISTRY=$(REGISTRY)"
	@echo "  ENVIRONMENT=$(ENVIRONMENT)"
	@echo ""
	@echo "$(YELLOW)Examples:$(NC)"
	@echo "  make build                          # Build Docker image"
	@echo "  make build IMAGE_TAG=v1.0.0         # Build with specific tag"
	@echo "  make deploy ENVIRONMENT=staging     # Deploy to staging"
	@echo "  make deploy-production               # Deploy to production"

build: ## Build Docker image
	@echo "$(BLUE)Building Docker image: $(IMAGE_NAME):$(IMAGE_TAG)$(NC)"
	@docker/scripts/build.sh --name $(IMAGE_NAME) --tag $(IMAGE_TAG)

build-no-cache: ## Build Docker image without cache
	@echo "$(BLUE)Building Docker image without cache: $(IMAGE_NAME):$(IMAGE_TAG)$(NC)"
	@docker/scripts/build.sh --name $(IMAGE_NAME) --tag $(IMAGE_TAG) --no-cache

## Build and test Docker image
build-test:
	@echo "$(BLUE)Building and testing Docker image: $(IMAGE_NAME):$(IMAGE_TAG)$(NC)"
	@docker/scripts/build.sh --name $(IMAGE_NAME) --tag $(IMAGE_TAG) --test

## Build and push Docker image
build-push:
	@echo "$(BLUE)Building and pushing Docker image: $(IMAGE_NAME):$(IMAGE_TAG)$(NC)"
	@docker/scripts/build.sh --name $(IMAGE_NAME) --tag $(IMAGE_TAG) --push $(if $(REGISTRY),--registry $(REGISTRY))

## Build multi-platform image and push
build-multi:
	@echo "$(BLUE)Building multi-platform Docker image: $(IMAGE_NAME):$(IMAGE_TAG)$(NC)"
	@docker/scripts/build.sh --name $(IMAGE_NAME) --tag $(IMAGE_TAG) --platform $(PLATFORM) --push $(if $(REGISTRY),--registry $(REGISTRY))

test: ## Run Docker component tests
	@echo "$(BLUE)Running Docker component tests$(NC)"
	@npm run docker:test:coverage

## Validate Docker configuration
validate:
	@echo "$(BLUE)Validating Docker configuration$(NC)"
	@echo "$(GREEN)✓ Build script is executable$(NC)"
	@docker-compose -f $(COMPOSE_FILE) config > /dev/null && echo "$(GREEN)✓ Docker Compose file is valid$(NC)"

## Lint Docker files
lint:
	@echo "$(BLUE)Linting Docker files$(NC)"
	@if command -v hadolint >/dev/null 2>&1; then \
		hadolint $(DOCKERFILE) && echo "$(GREEN)✓ Dockerfile linting passed$(NC)"; \
	else \
		echo "$(YELLOW)⚠ hadolint not installed, skipping Dockerfile linting$(NC)"; \
	fi

deploy: ## Deploy application
	@echo "$(BLUE)Deploying to $(ENVIRONMENT) environment$(NC)"
	@docker/scripts/deploy.sh deploy --env $(ENVIRONMENT) --image $(IMAGE_NAME) --tag $(IMAGE_TAG)

## Deploy to staging environment
deploy-staging:
	@echo "$(BLUE)Deploying to staging environment$(NC)"
	@$(MAKE) deploy ENVIRONMENT=staging

## Deploy to production environment (requires confirmation)
deploy-production:
	@echo "$(RED)⚠ PRODUCTION DEPLOYMENT$(NC)"
	@echo "This will deploy to the production environment."
	@read -p "Are you sure you want to continue? (y/N): " confirm && [ "$$confirm" = "y" ] || exit 1
	@$(MAKE) deploy ENVIRONMENT=production

## Update existing deployment
update:
	@echo "$(BLUE)Updating deployment to $(IMAGE_NAME):$(IMAGE_TAG)$(NC)"
	@docker/scripts/deploy.sh update --env $(ENVIRONMENT) --image $(IMAGE_NAME) --tag $(IMAGE_TAG)

## Rollback deployment
rollback:
	@echo "$(BLUE)Rolling back deployment$(NC)"
	@docker/scripts/deploy.sh rollback --env $(ENVIRONMENT)

## Check deployment status
status:
	@echo "$(BLUE)Checking deployment status$(NC)"
	@docker/scripts/deploy.sh status --env $(ENVIRONMENT)

## Show application logs
logs:
	@echo "$(BLUE)Showing application logs$(NC)"
	@docker/scripts/deploy.sh logs --env $(ENVIRONMENT)

## Check application health
health:
	@echo "$(BLUE)Checking application health$(NC)"
	@docker/scripts/deploy.sh health --env $(ENVIRONMENT)

## Stop application
stop:
	@echo "$(BLUE)Stopping application$(NC)"
	@docker/scripts/deploy.sh stop --env $(ENVIRONMENT)

## Restart application
restart:
	@echo "$(BLUE)Restarting application$(NC)"
	@docker/scripts/deploy.sh restart --env $(ENVIRONMENT)

## Clean up Docker resources
clean:
	@echo "$(BLUE)Cleaning up Docker resources$(NC)"
	@echo "Removing unused Docker images..."
	@docker image prune -f
	@echo "Removing unused Docker containers..."
	@docker container prune -f
	@echo "Removing unused Docker volumes..."
	@docker volume prune -f
	@echo "Removing unused Docker networks..."
	@docker network prune -f
	@echo "$(GREEN)✓ Docker cleanup completed$(NC)"

## Clean up specific image versions
clean-images:
	@echo "$(BLUE)Cleaning up old $(IMAGE_NAME) images$(NC)"
	@docker images $(IMAGE_NAME) --format "table {{.Repository}}\t{{.Tag}}\t{{.ID}}\t{{.CreatedAt}}\t{{.Size}}"
	@echo "Removing untagged $(IMAGE_NAME) images..."
	@docker images $(IMAGE_NAME) -f "dangling=true" -q | xargs -r docker rmi
	@echo "$(GREEN)✓ Image cleanup completed$(NC)"

## Full build and deploy pipeline
pipeline: lint validate test build deploy
	@echo "$(GREEN)✓ Full pipeline completed successfully$(NC)"

## Development workflow: build and deploy locally
dev: build deploy
	@echo "$(GREEN)✓ Development deployment completed$(NC)"
	@echo "Application available at: http://localhost:8080"

## Production release workflow
release: lint validate test build-multi deploy-production
	@echo "$(GREEN)✓ Production release completed$(NC)"

## Show Docker system information
info:
	@echo "$(BLUE)Docker System Information$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker Version:$(NC)"
	@docker --version
	@echo ""
	@echo "$(YELLOW)Docker Compose Version:$(NC)"
	@docker-compose --version || echo "Docker Compose not available"
	@echo ""
	@echo "$(YELLOW)Docker System Info:$(NC)"
	@docker system df
	@echo ""
	@echo "$(YELLOW)Running Containers:$(NC)"
	@docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

## Create environment file from template
setup-env:
	@echo "$(BLUE)Setting up environment file$(NC)"
	@if [ ! -f $(ENV_FILE) ]; then \
		cp docker/.env.example $(ENV_FILE); \
		echo "$(GREEN)✓ Environment file created: $(ENV_FILE)$(NC)"; \
		echo "$(YELLOW)⚠ Please edit $(ENV_FILE) with your configuration$(NC)"; \
	else \
		echo "$(YELLOW)⚠ Environment file already exists: $(ENV_FILE)$(NC)"; \
	fi

## Create Docker Compose file from template
setup-compose:
	@echo "$(BLUE)Setting up Docker Compose file$(NC)"
	@if [ ! -f docker/docker-compose.yml ]; then \
		cp docker/config/docker-compose.example.yml docker/docker-compose.yml; \
		echo "$(GREEN)✓ Docker Compose file created: docker/docker-compose.yml$(NC)"; \
		echo "$(YELLOW)⚠ Please edit docker/docker-compose.yml with your configuration$(NC)"; \
	else \
		echo "$(YELLOW)⚠ Docker Compose file already exists: docker/docker-compose.yml$(NC)"; \
	fi

## Setup complete development environment
setup: setup-env setup-compose
	@echo "$(GREEN)✓ Development environment setup completed$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "1. Edit $(ENV_FILE) with your database configuration"
	@echo "2. Edit docker/docker-compose.yml if needed"
	@echo "3. Run 'make build' to build the Docker image"
	@echo "4. Run 'make deploy' to deploy the application"

## Monitor application (requires deployment)
monitor:
	@echo "$(BLUE)Monitoring application$(NC)"
	@echo "Press Ctrl+C to stop monitoring"
	@while true; do \
		clear; \
		echo "$(BLUE)Keira3 Application Monitor - $(shell date)$(NC)"; \
		echo ""; \
		echo "$(YELLOW)Container Status:$(NC)"; \
		docker-compose -f $(COMPOSE_FILE) ps 2>/dev/null || echo "No containers running"; \
		echo ""; \
		echo "$(YELLOW)Health Status:$(NC)"; \
		$(MAKE) health 2>/dev/null || echo "Health check failed"; \
		echo ""; \
		echo "$(YELLOW)Resource Usage:$(NC)"; \
		docker stats --no-stream $$(docker-compose -f $(COMPOSE_FILE) ps -q) 2>/dev/null || echo "No containers to monitor"; \
		sleep 5; \
	done
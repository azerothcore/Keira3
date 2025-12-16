# Docker Build and Deploy Workflows

This document describes the comprehensive Docker build and deployment workflows for Keira3, including CI/CD pipelines, automated testing, and production deployment strategies.

## Overview

The Keira3 Docker implementation provides multiple workflow options:

1. **GitHub Actions CI/CD Pipeline** - Automated testing, building, and deployment
2. **Local Development Workflows** - Build and test locally using scripts and Make targets
3. **Production Deployment Workflows** - Secure, validated production deployments
4. **NPM Script Integration** - Easy access through package.json scripts

## GitHub Actions CI/CD Pipeline

### Workflow Triggers

The pipeline is triggered on:
- **Push to `master`** - Full pipeline with production deployment on releases
- **Push to `develop`** - Full pipeline with staging deployment
- **Pull Requests** - Testing and validation only
- **Releases** - Production deployment with security scanning
- **Feature branches** (`feature/docker-*`) - Testing and validation

### Pipeline Stages

#### 1. Test Docker Components
```yaml
- Lint Dockerfile with hadolint
- Validate Docker Compose configuration
- Run unit and integration tests for database API
- Generate test coverage reports
- Upload coverage to Codecov
```

#### 2. Build and Test Image
```yaml
- Set up Docker Buildx for multi-platform builds
- Build Docker image with layer caching
- Start test MySQL database service
- Test container startup and health endpoints
- Validate database connectivity through API
- Cleanup test resources
```

#### 3. Build and Push (non-PR only)
```yaml
- Build multi-platform images (linux/amd64, linux/arm64)
- Push to GitHub Container Registry (ghcr.io)
- Generate semantic tags based on branch/version
- Create Software Bill of Materials (SBOM)
- Upload build artifacts
```

#### 4. Security Scanning
```yaml
- Run Trivy vulnerability scanner
- Upload security scan results to GitHub Security tab
- Fail pipeline on critical vulnerabilities (optional)
```

#### 5. Environment Deployments
```yaml
- Deploy to staging environment (develop branch)
- Deploy to production environment (releases only)
- Run comprehensive health checks
- Send deployment notifications
```

### Environment Variables

Set these secrets in your GitHub repository:

```bash
# Optional: Custom registry credentials
DOCKER_REGISTRY_URL=ghcr.io
DOCKER_REGISTRY_USERNAME=${{ github.actor }}
DOCKER_REGISTRY_PASSWORD=${{ secrets.GITHUB_TOKEN }}

# Staging environment
STAGING_DB_HOST=staging-db.example.com
STAGING_DB_USER=staging_user
STAGING_DB_PASSWORD=${{ secrets.STAGING_DB_PASSWORD }}
STAGING_DB_NAME=acore_world_staging

# Production environment
PROD_DB_HOST=prod-db.example.com
PROD_DB_USER=prod_user
PROD_DB_PASSWORD=${{ secrets.PROD_DB_PASSWORD }}
PROD_DB_NAME=acore_world
```

## Local Development Workflows

### Quick Start

```bash
# Setup development environment
make setup

# Edit configuration files
vim docker/.env
vim docker-compose.yml

# Build and deploy locally
make dev
```

### Using Make Commands

```bash
# Build operations
make build                    # Build Docker image
make build-no-cache          # Build without cache
make build-test              # Build and run tests
make build-push              # Build and push to registry

# Deployment operations
make deploy                  # Deploy to development
make deploy-staging          # Deploy to staging
make deploy-production       # Deploy to production (with confirmation)

# Management operations
make status                  # Check deployment status
make logs                   # View application logs
make health                 # Check application health
make restart                # Restart application

# Maintenance operations
make clean                  # Clean up Docker resources
make monitor                # Monitor application in real-time
```

### Using NPM Scripts

```bash
# Build operations
npm run docker:build         # Build Docker image
npm run docker:build:test    # Build and test
npm run docker:build:push    # Build and push

# Deployment operations
npm run docker:deploy                # Deploy to development
npm run docker:deploy:staging        # Deploy to staging
npm run docker:deploy:production     # Deploy to production

# Management operations
npm run docker:status        # Check status
npm run docker:logs         # View logs
npm run docker:health       # Health check
npm run docker:restart      # Restart

# Testing operations
npm run docker:test          # Run Docker tests
npm run docker:test:watch    # Run tests in watch mode
npm run docker:test:coverage # Run tests with coverage
```

### Using Shell Scripts Directly

```bash
# Build script
./docker/scripts/build.sh --help
./docker/scripts/build.sh --name keira3 --tag v1.0.0 --test

# Deploy script
./docker/scripts/deploy.sh --help
./docker/scripts/deploy.sh deploy --env production --image keira3 --tag v1.0.0
```

## Production Deployment Workflows

### Pre-Deployment Checklist

1. **Security Review**
   - [ ] All secrets are properly configured
   - [ ] Database credentials are secure
   - [ ] Network security is configured
   - [ ] SSL/TLS certificates are valid

2. **Configuration Review**
   - [ ] Environment variables are set correctly
   - [ ] Resource limits are appropriate
   - [ ] Monitoring and logging are configured
   - [ ] Backup procedures are in place

3. **Testing**
   - [ ] All automated tests pass
   - [ ] Security scans show no critical issues
   - [ ] Performance tests meet requirements
   - [ ] Manual testing completed

### Blue-Green Deployment

```bash
# 1. Deploy new version to staging
make deploy-staging IMAGE_TAG=v1.0.0

# 2. Run staging tests
curl -f https://staging.keira.example.com/health
curl -f https://staging.keira.example.com/api/database/state

# 3. Deploy to production (blue-green)
make deploy-production IMAGE_TAG=v1.0.0

# 4. Verify production deployment
make health ENVIRONMENT=production

# 5. Rollback if needed
make rollback ENVIRONMENT=production
```

### Rolling Update Deployment

```bash
# 1. Update production with rolling strategy
docker-compose -f docker-compose.prod.yml up -d --scale keira3=3

# 2. Health check during rollout
while true; do
  make health ENVIRONMENT=production
  sleep 30
done

# 3. Complete rollout
docker-compose -f docker-compose.prod.yml up -d
```

### Canary Deployment

```bash
# 1. Deploy canary version (10% traffic)
make deploy ENVIRONMENT=production IMAGE_TAG=v1.0.0-canary

# 2. Monitor metrics and logs
make monitor ENVIRONMENT=production

# 3. Gradually increase traffic
# Edit load balancer configuration to route more traffic

# 4. Full deployment after validation
make deploy-production IMAGE_TAG=v1.0.0
```

## Environment-Specific Configurations

### Development Environment

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  keira3:
    image: keira3:latest
    environment:
      NODE_ENV: development
      DEBUG: "true"
      LOG_LEVEL: debug
    volumes:
      - ./logs:/var/log/nginx
    ports:
      - "8080:8080"
      - "3001:3001"
```

### Staging Environment

```yaml
# docker-compose.staging.yml
version: '3.8'
services:
  keira3:
    image: ghcr.io/azerothcore/keira3:develop
    environment:
      NODE_ENV: staging
      LOG_LEVEL: info
    deploy:
      replicas: 1
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

### Production Environment

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  keira3:
    image: ghcr.io/azerothcore/keira3:latest
    environment:
      NODE_ENV: production
      LOG_LEVEL: warn
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 30s
        failure_action: rollback
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
```

## Monitoring and Observability

### Health Monitoring

```bash
# Application health checks
curl -f http://localhost:8080/health
curl -f http://localhost:3001/health
curl -f http://localhost:3001/api/database/state

# Container health monitoring
docker healthcheck keira3
make health

# Automated monitoring
make monitor  # Real-time dashboard
```

### Logging

```bash
# Application logs
make logs
docker-compose logs -f keira3

# Structured logging
docker-compose logs --tail=100 keira3 | grep ERROR
docker-compose logs --since=1h keira3
```

### Metrics

```bash
# Resource usage
docker stats keira3
make info

# Application metrics (if enabled)
curl http://localhost:3001/metrics
```

## Troubleshooting Workflows

### Common Issues

#### Container Won't Start
```bash
# Check container logs
make logs

# Check configuration
make validate

# Test database connectivity
docker run --rm --network host mysql:8.0 \
  mysql -h $KEIRA_DATABASE_HOST -u $KEIRA_DATABASE_USER -p

# Restart with debug mode
docker run -it --rm \
  -e DEBUG=true \
  -e LOG_LEVEL=debug \
  keira3:latest /bin/sh
```

#### Database Connection Issues
```bash
# Test database connectivity
make health

# Check database logs
docker-compose logs mysql

# Verify credentials
docker run --rm --network host \
  -e MYSQL_PWD=$KEIRA_DATABASE_PASSWORD \
  mysql:8.0 mysql -h $KEIRA_DATABASE_HOST -u $KEIRA_DATABASE_USER -e "SELECT 1"
```

#### Performance Issues
```bash
# Monitor resource usage
make monitor

# Check container limits
docker inspect keira3 | grep -A 10 "Memory\|Cpu"

# Analyze application metrics
curl -s http://localhost:3001/metrics | grep -E "(memory|cpu|response_time)"
```

### Debug Mode

```bash
# Enable debug logging
docker run -d \
  --name keira3-debug \
  -e DEBUG=true \
  -e LOG_LEVEL=debug \
  -e DETAILED_ERRORS=true \
  keira3:latest

# Access debug information
docker exec -it keira3-debug /bin/sh
curl http://localhost:3001/debug/info
```

## Security Considerations

### Image Security

```bash
# Scan for vulnerabilities
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image keira3:latest

# Check for secrets in image
docker history --no-trunc keira3:latest
```

### Runtime Security

```bash
# Run with security constraints
docker run -d \
  --name keira3 \
  --read-only \
  --tmpfs /tmp \
  --tmpfs /var/cache \
  --user 1001:1001 \
  --cap-drop ALL \
  --cap-add CHOWN \
  --cap-add SETGID \
  --cap-add SETUID \
  keira3:latest
```

### Network Security

```bash
# Use custom network
docker network create --driver bridge keira-network

# Run with network isolation
docker-compose -f docker-compose.yml \
  -f docker-compose.security.yml up -d
```

## Performance Optimization

### Build Optimization

```bash
# Use build cache
docker build --cache-from keira3:latest .

# Multi-stage build optimization
docker build --target production .

# BuildKit for improved performance
DOCKER_BUILDKIT=1 docker build .
```

### Runtime Optimization

```bash
# Resource limits
docker run -d \
  --memory=1g \
  --cpus=1.0 \
  --oom-kill-disable=false \
  keira3:latest

# Performance monitoring
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
```

This comprehensive workflow documentation provides all the necessary information for building, testing, deploying, and maintaining Keira3 Docker deployments across different environments and use cases.
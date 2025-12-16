# CI/CD Process Documentation

This document provides a comprehensive overview of the Continuous Integration and Continuous Deployment (CI/CD) process for Keira3's Docker implementation.

## Overview

The Keira3 CI/CD pipeline is designed to ensure code quality, security, and reliable deployments across multiple environments. It integrates seamlessly with the hybrid architecture supporting both Electron and Docker deployments.

## Pipeline Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Code Commit   │    │  Automated      │    │   Build &       │    │   Deployment    │
│   (Git Push)    │───►│  Testing        │───►│   Security      │───►│   (Multi-Env)   │
│                 │    │  & Validation   │    │   Scanning      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ • Push to       │    │ • Lint Docker   │    │ • Multi-platform│    │ • Development   │
│   master/develop│    │   files         │    │   builds        │    │ • Staging       │
│ • Pull requests │    │ • Unit tests    │    │ • Vulnerability │    │ • Production    │
│ • Feature       │    │ • Integration   │    │   scanning      │    │ • Health checks │
│   branches      │    │   tests         │    │ • SBOM          │    │ • Monitoring    │
│ • Releases      │    │ • Type checking │    │   generation    │    │ • Rollback      │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Trigger Conditions

### Automatic Triggers

| Trigger | Branches | Pipeline Stages | Deployment |
|---------|----------|-----------------|------------|
| **Push** | `master` | Full pipeline | Production (on releases) |
| **Push** | `develop` | Full pipeline | Staging |
| **Push** | `feature/docker-*` | Test & validate | None |
| **Pull Request** | → `master`, `develop` | Test & validate | None |
| **Release** | `master` | Full + Security | Production |

### Manual Triggers

```yaml
# Manual workflow dispatch
workflow_dispatch:
  inputs:
    environment:
      description: 'Deployment environment'
      required: true
      default: 'staging'
      type: choice
      options:
        - staging
        - production
    image_tag:
      description: 'Docker image tag'
      required: true
      default: 'latest'
```

## Pipeline Stages

### Stage 1: Test Docker Components

**Duration:** ~5-10 minutes
**Runs on:** All triggers

```yaml
test-docker-components:
  steps:
    - Checkout repository
    - Setup Node.js 20
    - Install dependencies
    - Lint Dockerfile with hadolint
    - Validate Docker Compose syntax
    - Run Docker-specific unit tests
    - Run integration tests
    - Generate coverage reports
    - Upload coverage to Codecov
```

**Quality Gates:**
- ✅ Dockerfile passes hadolint checks
- ✅ Docker Compose file is valid
- ✅ Test coverage ≥ 90% (lines, functions, branches)
- ✅ All unit tests pass
- ✅ All integration tests pass

### Stage 2: Build and Test Image

**Duration:** ~15-25 minutes
**Runs on:** All triggers
**Dependencies:** `test-docker-components`

```yaml
build-and-test-image:
  services:
    mysql: # Test database service
      image: mysql:8.0
      env:
        MYSQL_ROOT_PASSWORD: test_password
        MYSQL_DATABASE: test_db

  steps:
    - Setup Docker Buildx
    - Build test image with cache
    - Start container with test database
    - Wait for container startup (120s timeout)
    - Test health endpoints
    - Test database connectivity
    - Validate API responses
    - Cleanup test resources
```

**Quality Gates:**
- ✅ Docker image builds successfully
- ✅ Container starts within 120 seconds
- ✅ Web health check responds (200 OK)
- ✅ API health check responds (200 OK)
- ✅ Database connection successful
- ✅ API endpoints return valid responses

### Stage 3: Build and Push

**Duration:** ~20-30 minutes
**Runs on:** Push to `master`/`develop`, releases
**Dependencies:** `build-and-test-image`

```yaml
build-and-push:
  permissions:
    contents: read
    packages: write

  steps:
    - Setup Docker Buildx
    - Login to GitHub Container Registry
    - Extract metadata (tags, labels)
    - Build multi-platform image
      * linux/amd64
      * linux/arm64
    - Push to registry
    - Generate SBOM (Software Bill of Materials)
    - Upload artifacts
```

**Outputs:**
- Docker image: `ghcr.io/azerothcore/keira3:tag`
- SBOM: Software Bill of Materials
- Image digest: SHA256 hash for verification

**Tagging Strategy:**
```bash
# Branch-based tags
master → latest, master-sha
develop → develop, develop-sha

# Release tags
v1.2.3 → v1.2.3, v1.2, v1, latest

# Feature branch tags
feature/docker-xyz → feature-docker-xyz-sha
```

### Stage 4: Security Scanning

**Duration:** ~5-10 minutes
**Runs on:** Push to `master`/`develop`, releases
**Dependencies:** `build-and-push`

```yaml
security-scan:
  permissions:
    security-events: write

  steps:
    - Run Trivy vulnerability scanner
    - Generate SARIF security report
    - Upload to GitHub Security tab
    - Check for critical vulnerabilities
```

**Security Gates:**
- ✅ No critical vulnerabilities
- ✅ High vulnerabilities ≤ 5
- ✅ SARIF report uploaded successfully
- ⚠️ Pipeline continues with warnings for medium/low

### Stage 5: Deploy Staging

**Duration:** ~5-10 minutes
**Runs on:** Push to `develop`
**Dependencies:** `build-and-push`, `security-scan`

```yaml
deploy-staging:
  environment: staging

  steps:
    - Checkout repository
    - Create deployment manifest
    - Deploy using Docker Compose
    - Wait for health checks
    - Run deployment validation
    - Update deployment status
```

**Environment Configuration:**
```yaml
staging:
  KEIRA_DATABASE_HOST: staging-db.internal
  KEIRA_DATABASE_NAME: acore_world_staging
  NODE_ENV: staging
  LOG_LEVEL: info
  REPLICAS: 1
```

### Stage 6: Deploy Production

**Duration:** ~10-15 minutes
**Runs on:** Releases only
**Dependencies:** `build-and-push`, `security-scan`

```yaml
deploy-production:
  environment: production

  steps:
    - Checkout repository
    - Create production deployment manifest
    - Deploy with rolling update strategy
    - Run comprehensive health checks
    - Validate production endpoints
    - Send deployment notifications
```

**Environment Configuration:**
```yaml
production:
  KEIRA_DATABASE_HOST: prod-db.internal
  KEIRA_DATABASE_NAME: acore_world
  NODE_ENV: production
  LOG_LEVEL: warn
  REPLICAS: 3
  ROLLING_UPDATE: true
```

## Environment Management

### Development Environment

**Purpose:** Local development and testing
**Access:** Direct Docker run or Docker Compose
**Database:** Local MySQL or test database

```bash
# Quick setup
make setup
make dev

# Manual setup
cp docker/.env.example docker/.env
vim docker/.env  # Configure database
docker-compose up -d
```

### Staging Environment

**Purpose:** Pre-production testing and validation
**Access:** Automated deployment from `develop` branch
**Database:** Staging database with production-like data

**Features:**
- Automatic deployment on develop branch pushes
- Production-like configuration
- Comprehensive logging and monitoring
- Performance testing
- User acceptance testing

**Monitoring:**
```bash
# Health monitoring
curl https://staging.keira.example.com/health
curl https://staging.keira.example.com/api/database/state

# Logs monitoring
kubectl logs -f deployment/keira3-staging
```

### Production Environment

**Purpose:** Live application serving end users
**Access:** Automated deployment on releases only
**Database:** Production database

**Features:**
- Blue-green deployment strategy
- Automatic rollback on health check failures
- Comprehensive monitoring and alerting
- High availability (3 replicas)
- Performance optimization

**Safety Measures:**
- Manual approval required for deployments
- Comprehensive health checks before traffic routing
- Automatic rollback on failure
- Database backup before deployment
- Canary deployment option

## Deployment Strategies

### Rolling Update (Default)

```yaml
deploy:
  replicas: 3
  update_config:
    parallelism: 1        # Update 1 container at a time
    delay: 30s           # Wait 30s between updates
    failure_action: rollback
    max_failure_ratio: 0.3
```

**Process:**
1. Update first replica
2. Wait for health checks to pass
3. Wait 30 seconds
4. Update second replica
5. Continue until all replicas updated
6. Rollback if failure rate > 30%

### Blue-Green Deployment

```bash
# Deploy to blue environment
make deploy-production IMAGE_TAG=v1.0.0 ENVIRONMENT=blue

# Run validation tests
make health ENVIRONMENT=blue

# Switch traffic to blue
kubectl patch service keira3 -p '{"spec":{"selector":{"version":"blue"}}}'

# Monitor and rollback if needed
make rollback ENVIRONMENT=production
```

### Canary Deployment

```bash
# Deploy canary (10% traffic)
kubectl apply -f k8s/canary-deployment.yml

# Monitor metrics
kubectl top pods -l version=canary
curl https://monitoring.example.com/keira3-canary

# Promote canary to production
kubectl apply -f k8s/production-deployment.yml
```

## Quality Gates and Checks

### Code Quality Gates

| Check | Tool | Threshold | Action |
|-------|------|-----------|--------|
| **Dockerfile Lint** | hadolint | 0 errors | ❌ Fail |
| **TypeScript Compile** | tsc | 0 errors | ❌ Fail |
| **Unit Tests** | Jest | 100% pass | ❌ Fail |
| **Integration Tests** | Jest | 100% pass | ❌ Fail |
| **Test Coverage** | Jest | ≥90% lines | ❌ Fail |
| **Code Format** | Prettier | 100% formatted | ❌ Fail |
| **Lint Rules** | ESLint | 0 errors | ❌ Fail |

### Security Gates

| Check | Tool | Threshold | Action |
|-------|------|-----------|--------|
| **Critical CVE** | Trivy | 0 critical | ❌ Fail |
| **High CVE** | Trivy | ≤5 high | ⚠️ Warning |
| **Secret Scan** | TruffleHog | 0 secrets | ❌ Fail |
| **License Check** | FOSSA | Approved only | ⚠️ Warning |

### Performance Gates

| Check | Metric | Threshold | Action |
|-------|--------|-----------|--------|
| **Image Size** | Docker | ≤1GB | ⚠️ Warning |
| **Build Time** | CI | ≤30min | ⚠️ Warning |
| **Startup Time** | Health check | ≤120s | ❌ Fail |
| **Memory Usage** | Runtime | ≤512MB | ⚠️ Warning |

## Monitoring and Observability

### Build Monitoring

```yaml
# GitHub Actions metrics
- Build success rate
- Build duration trends
- Test execution time
- Coverage trends
- Security scan results
```

### Deployment Monitoring

```yaml
# Application metrics
- Health check success rate
- Response time (p50, p95, p99)
- Error rate
- Database connection status
- Resource utilization

# Infrastructure metrics
- Container restart count
- Memory usage trends
- CPU utilization
- Network throughput
- Disk usage
```

### Alerting

```yaml
# Critical alerts (PagerDuty)
- Production deployment failures
- Health check failures (>2 consecutive)
- Critical security vulnerabilities
- Database connection failures

# Warning alerts (Slack)
- Staging deployment failures
- Performance degradation
- High resource usage
- Test failures on develop branch
```

## Rollback Procedures

### Automatic Rollback

**Triggers:**
- Health check failures (>3 consecutive)
- Error rate >5% for 5 minutes
- Memory usage >90% for 10 minutes
- CPU usage >95% for 5 minutes

**Process:**
```bash
# Automatic rollback in CI/CD
if health_check_fails_3_times; then
  kubectl rollout undo deployment/keira3
  send_alert "Automatic rollback triggered"
fi
```

### Manual Rollback

**Emergency Rollback:**
```bash
# Immediate rollback to last known good version
make rollback ENVIRONMENT=production

# Or using kubectl directly
kubectl rollout undo deployment/keira3

# Or using Docker Compose
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

**Planned Rollback:**
```bash
# Rollback to specific version
make deploy ENVIRONMENT=production IMAGE_TAG=v1.0.0

# Verify rollback
make health ENVIRONMENT=production
```

## Troubleshooting CI/CD Issues

### Build Failures

#### Dockerfile Lint Errors
```bash
# Run locally
hadolint docker/Dockerfile

# Common fixes
- Use specific image tags (not :latest)
- Add HEALTHCHECK instruction
- Use multi-stage builds
- Minimize RUN layers
```

#### Test Failures
```bash
# Run tests locally
npm run docker:test:coverage

# Debug test issues
npm run docker:test:watch
docker run -it keira3:test /bin/sh
```

#### Build Timeout
```bash
# Check build cache usage
docker build --cache-from keira3:latest .

# Optimize Dockerfile
- Combine RUN commands
- Use .dockerignore
- Order layers by change frequency
```

### Deployment Failures

#### Container Won't Start
```bash
# Check logs
kubectl logs deployment/keira3
make logs

# Debug container
docker run -it --rm keira3:latest /bin/sh

# Common issues
- Missing environment variables
- Database connection failures
- Port conflicts
- Resource constraints
```

#### Health Check Failures
```bash
# Test health endpoints
curl -f http://localhost:8080/health
curl -f http://localhost:3001/health

# Check service status
kubectl get pods -l app=keira3
kubectl describe pod keira3-xxx

# Common causes
- Database connectivity issues
- Incorrect environment configuration
- Resource exhaustion
- Network policies blocking traffic
```

#### Performance Issues
```bash
# Monitor resource usage
kubectl top pods
make monitor

# Check application metrics
curl http://localhost:3001/metrics

# Analyze performance
- Increase resource limits
- Optimize database queries
- Enable caching
- Review memory leaks
```

## CI/CD Best Practices

### Security Best Practices

1. **Secrets Management**
   - Use GitHub Secrets for sensitive data
   - Rotate secrets regularly
   - Use least privilege access
   - Audit secret usage

2. **Image Security**
   - Scan for vulnerabilities
   - Use minimal base images
   - Keep dependencies updated
   - Sign container images

3. **Network Security**
   - Use private networks
   - Implement network policies
   - Enable TLS everywhere
   - Monitor network traffic

### Performance Optimization

1. **Build Optimization**
   - Use layer caching effectively
   - Optimize Dockerfile order
   - Use multi-stage builds
   - Implement .dockerignore

2. **Pipeline Optimization**
   - Run jobs in parallel
   - Use appropriate runners
   - Cache dependencies
   - Minimize artifact sizes

3. **Deployment Optimization**
   - Use rolling updates
   - Implement readiness probes
   - Set appropriate resource limits
   - Monitor performance metrics

### Reliability Improvements

1. **Testing Strategy**
   - Comprehensive test coverage
   - Integration testing
   - Performance testing
   - Security testing

2. **Monitoring and Alerting**
   - Comprehensive metrics
   - Proactive alerting
   - Log aggregation
   - Distributed tracing

3. **Disaster Recovery**
   - Automated backups
   - Multi-region deployments
   - Disaster recovery testing
   - Documentation updates

This CI/CD process ensures reliable, secure, and efficient deployment of Keira3 Docker containers while maintaining high code quality and operational excellence.
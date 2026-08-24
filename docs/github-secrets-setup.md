# GitHub Secrets Setup for Docker Deployment

This document outlines all the required GitHub repository secrets needed to execute the CI/CD pipeline, including pushing to DockerHub and other container registries.

## Overview

The Keira3 CI/CD pipeline supports multiple container registries and deployment environments. Depending on your configuration, different secrets are required.

## Current Configuration Analysis

### Default Configuration (GitHub Container Registry)

The current workflow is configured to use **GitHub Container Registry (ghcr.io)** by default:

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
```

**Required Secrets:** ✅ **NONE** - Uses built-in `GITHUB_TOKEN`

The workflow uses the automatically provided `GITHUB_TOKEN` for authentication:
```yaml
- name: Log in to Container Registry
  uses: docker/login-action@v3
  with:
    registry: ${{ env.REGISTRY }}
    username: ${{ github.actor }}
    password: ${{ secrets.GITHUB_TOKEN }}
```

## DockerHub Configuration

To push to DockerHub instead of (or in addition to) GitHub Container Registry, you need to modify the workflow and add secrets.

### Required Secrets for DockerHub

| Secret Name | Description | Required | Example Value |
|-------------|-------------|----------|---------------|
| `DOCKERHUB_USERNAME` | DockerHub username | ✅ **Yes** | `myusername` |
| `DOCKERHUB_TOKEN` | DockerHub access token | ✅ **Yes** | `dckr_pat_...` |

### Optional Configuration Secrets

| Secret Name | Description | Required | Example Value |
|-------------|-------------|----------|---------------|
| `DOCKER_REGISTRY` | Override default registry | ❌ No | `docker.io` |
| `DOCKER_IMAGE_NAME` | Override image name | ❌ No | `myusername/keira3` |

## Setting Up DockerHub Secrets

### Step 1: Create DockerHub Access Token

1. **Log in to DockerHub**
   - Go to https://hub.docker.com/
   - Sign in to your account

2. **Create Access Token**
   - Go to Account Settings → Security
   - Click "New Access Token"
   - Name: `Keira3-GitHub-Actions`
   - Permissions: `Read, Write, Delete`
   - Copy the generated token (starts with `dckr_pat_`)

### Step 2: Add Secrets to GitHub Repository

1. **Navigate to Repository Settings**
   - Go to your GitHub repository
   - Click "Settings" tab
   - Click "Secrets and variables" → "Actions"

2. **Add DockerHub Secrets**
   ```
   Name: DOCKERHUB_USERNAME
   Value: your-dockerhub-username

   Name: DOCKERHUB_TOKEN
   Value: dckr_pat_xxxxxxxxxxxxxxxxxx
   ```

3. **Optional: Override Default Configuration**
   ```
   Name: DOCKER_REGISTRY
   Value: docker.io

   Name: DOCKER_IMAGE_NAME
   Value: your-dockerhub-username/keira3
   ```

## Modified Workflow for DockerHub Support

Here's how to modify the workflow to support both GitHub Container Registry and DockerHub:

### Option 1: DockerHub Only

```yaml
env:
  REGISTRY: docker.io
  IMAGE_NAME: ${{ secrets.DOCKERHUB_USERNAME }}/keira3

jobs:
  build-and-push:
    steps:
      - name: Log in to DockerHub
        uses: docker/login-action@v3
        with:
          registry: docker.io
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
```

### Option 2: Multi-Registry Support

```yaml
env:
  GHCR_REGISTRY: ghcr.io
  DOCKERHUB_REGISTRY: docker.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    steps:
      # Login to GitHub Container Registry
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.GHCR_REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      # Login to DockerHub
      - name: Log in to DockerHub
        if: ${{ secrets.DOCKERHUB_USERNAME }}
        uses: docker/login-action@v3
        with:
          registry: ${{ env.DOCKERHUB_REGISTRY }}
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # Extract metadata for multiple registries
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: |
            ${{ env.GHCR_REGISTRY }}/${{ env.IMAGE_NAME }}
            ${{ env.DOCKERHUB_REGISTRY }}/${{ secrets.DOCKERHUB_USERNAME }}/keira3
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-
            type=raw,value=latest,enable={{is_default_branch}}

      # Build and push to both registries
      - name: Build and push Docker image
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          file: docker/Dockerfile
          platforms: linux/amd64,linux/arm64
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

## Deployment Environment Secrets

### Staging Environment

| Secret Name | Description | Required | Example Value |
|-------------|-------------|----------|---------------|
| `STAGING_DB_HOST` | Staging database host | ✅ **Yes** | `staging-db.example.com` |
| `STAGING_DB_USER` | Staging database username | ✅ **Yes** | `staging_user` |
| `STAGING_DB_PASSWORD` | Staging database password | ✅ **Yes** | `secure_password_123` |
| `STAGING_DB_NAME` | Staging database name | ❌ No | `acore_world_staging` |
| `STAGING_DB_PORT` | Staging database port | ❌ No | `3306` |

### Production Environment

| Secret Name | Description | Required | Example Value |
|-------------|-------------|----------|---------------|
| `PROD_DB_HOST` | Production database host | ✅ **Yes** | `prod-db.example.com` |
| `PROD_DB_USER` | Production database username | ✅ **Yes** | `prod_user` |
| `PROD_DB_PASSWORD` | Production database password | ✅ **Yes** | `very_secure_password_456` |
| `PROD_DB_NAME` | Production database name | ❌ No | `acore_world` |
| `PROD_DB_PORT` | Production database port | ❌ No | `3306` |

## Optional Integration Secrets

### Code Coverage (Codecov)

| Secret Name | Description | Required | Example Value |
|-------------|-------------|----------|---------------|
| `CODECOV_TOKEN` | Codecov upload token | ❌ No | `12345678-1234-1234-1234-123456789012` |

### Notification Services

| Secret Name | Description | Required | Example Value |
|-------------|-------------|----------|---------------|
| `SLACK_WEBHOOK_URL` | Slack notification webhook | ❌ No | `https://hooks.slack.com/services/...` |
| `DISCORD_WEBHOOK_URL` | Discord notification webhook | ❌ No | `https://discord.com/api/webhooks/...` |

## Security Best Practices

### 1. Secret Rotation

- **DockerHub Tokens**: Rotate every 90 days
- **Database Passwords**: Rotate every 30-60 days
- **API Keys**: Follow service provider recommendations

### 2. Principle of Least Privilege

- **DockerHub Token**: Only grant `Read, Write` permissions (not `Delete` unless needed)
- **Database Users**: Create dedicated CI/CD users with minimal required permissions
- **Environment Separation**: Use different credentials for staging and production

### 3. Secret Validation

```yaml
# Add validation step to workflow
- name: Validate required secrets
  run: |
    if [ -z "${{ secrets.DOCKERHUB_USERNAME }}" ]; then
      echo "Error: DOCKERHUB_USERNAME secret is required"
      exit 1
    fi
    if [ -z "${{ secrets.DOCKERHUB_TOKEN }}" ]; then
      echo "Error: DOCKERHUB_TOKEN secret is required"
      exit 1
    fi
    echo "All required secrets are configured"
```

## Complete Setup Checklist

### For DockerHub Deployment

- [ ] Create DockerHub account
- [ ] Create DockerHub repository (e.g., `username/keira3`)
- [ ] Generate DockerHub access token
- [ ] Add `DOCKERHUB_USERNAME` secret to GitHub
- [ ] Add `DOCKERHUB_TOKEN` secret to GitHub
- [ ] Update workflow file to use DockerHub
- [ ] Test workflow with a push to develop branch

### For Staging Environment

- [ ] Set up staging database server
- [ ] Create staging database user with appropriate permissions
- [ ] Add `STAGING_DB_HOST` secret to GitHub
- [ ] Add `STAGING_DB_USER` secret to GitHub
- [ ] Add `STAGING_DB_PASSWORD` secret to GitHub
- [ ] Configure staging environment in workflow
- [ ] Test staging deployment

### For Production Environment

- [ ] Set up production database server
- [ ] Create production database user with appropriate permissions
- [ ] Add `PROD_DB_HOST` secret to GitHub
- [ ] Add `PROD_DB_USER` secret to GitHub
- [ ] Add `PROD_DB_PASSWORD` secret to GitHub
- [ ] Configure production environment in workflow
- [ ] Test production deployment (carefully!)

## Troubleshooting

### Common Issues

#### 1. DockerHub Authentication Failed
```
Error: denied: requested access to the resource is denied
```
**Solution:** Verify `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` are correctly set

#### 2. Database Connection Failed
```
Error: Access denied for user 'staging_user'@'x.x.x.x'
```
**Solution:** Verify database credentials and user permissions

#### 3. Registry Push Failed
```
Error: failed to push to registry
```
**Solution:** Check repository exists and token has write permissions

### Validation Commands

```bash
# Test DockerHub login locally
echo $DOCKERHUB_TOKEN | docker login docker.io -u $DOCKERHUB_USERNAME --password-stdin

# Test database connection
mysql -h $STAGING_DB_HOST -u $STAGING_DB_USER -p$STAGING_DB_PASSWORD $STAGING_DB_NAME -e "SELECT 1"

# Validate workflow syntax
act --list  # If using act for local testing
```

## Summary

### Minimum Required Secrets for DockerHub

For a basic DockerHub deployment, you only need:

1. **`DOCKERHUB_USERNAME`** - Your DockerHub username
2. **`DOCKERHUB_TOKEN`** - DockerHub access token

### Full Production Setup

For a complete production deployment with staging:

1. **DockerHub**: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`
2. **Staging DB**: `STAGING_DB_HOST`, `STAGING_DB_USER`, `STAGING_DB_PASSWORD`
3. **Production DB**: `PROD_DB_HOST`, `PROD_DB_USER`, `PROD_DB_PASSWORD`

All other secrets are optional and can be added as needed for additional functionality.
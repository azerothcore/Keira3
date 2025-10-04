# Docker Directory Structure

This document describes the organized file structure for Keira3's Docker deployment components.

## Directory Overview

```
docker/
├── Dockerfile                              # Multi-stage Docker build configuration
├── README.md                               # Docker deployment quick start guide
├── STRUCTURE.md                            # This file - directory structure documentation
├── .env.example                            # Environment variables template
├── .env                                    # Environment variables (created from template)
├── docker-compose.yml                      # Main Docker Compose configuration
├── docker-start.sh                         # Container startup script (executable)
│
├── api/                                    # Database API service components
│   ├── database-api.js                     # Main database API service (Node.js/Express)
│   └── database-api.types.js               # JavaScript type definitions and utilities
│
├── config/                                 # Docker configuration templates and files
│   ├── docker-compose.example.yml          # Docker Compose configuration template
│   ├── docker-start.sh                     # Container startup script (main version)
│   └── nginx.conf                          # nginx reverse proxy configuration
│
├── scripts/                                # Build and deployment scripts
│   ├── build.sh                            # Docker image build script
│   └── deploy.sh                           # Docker deployment script
│
└── tests/                                  # Docker-specific test suites
    ├── jest.config.js                      # Jest test configuration
    ├── setup.js                            # Test environment setup
    ├── database-api.spec.js                # Unit tests for database API
    ├── database-api.integration.spec.js    # Integration tests for API endpoints
    └── database-connection-pool.integration.spec.js  # Connection pool tests
```

## File Descriptions

### Core Docker Files

#### `Dockerfile`
Multi-stage Docker build configuration that:
- **Stage 1 (builder)**: Compiles Angular application and prepares Node.js dependencies
- **Stage 2 (production)**: Creates optimized runtime container with nginx and Node.js API service
- Implements security best practices with non-root user and minimal attack surface
- Includes comprehensive health checks and monitoring

#### `README.md`
Quick start guide for Docker deployment including:
- Basic build and run commands
- Environment variable configuration
- Integration with existing Docker stacks
- Troubleshooting common issues

### API Service (`api/`)

#### `database-api.js`
Core database API service featuring:
- Express.js REST API with MySQL2 connection pooling
- Comprehensive error handling with proper HTTP status codes
- Request validation and sanitization
- Health monitoring and metrics endpoints
- Graceful shutdown handling

#### `database-api.types.js`
JavaScript type definitions and utilities:
- JSDoc type annotations for API interfaces
- Validation functions for request/response objects
- Error handling utilities and constants
- Configuration management helpers

### Environment Configuration

#### `.env.example`
Comprehensive environment variables template:
- Database connection settings (required)
- API service configuration (optional)
- Performance tuning parameters
- Security and monitoring settings
- Development and debugging options

### Build and Deployment Scripts (`scripts/`)

#### `build.sh`
Comprehensive Docker image build script:
- Multi-platform build support (AMD64/ARM64)
- Built-in validation and testing
- Registry push capabilities
- Detailed logging and error handling
- Command-line argument parsing

#### `deploy.sh`
Complete deployment lifecycle management:
- Environment-specific configurations
- Health checking and monitoring
- Rollback capabilities
- Blue-green deployment support
- Docker Compose integration

### Configuration (`config/`)

#### `docker-compose.example.yml`
Production-ready Docker Compose configuration:
- Keira3 application service with health checks
- MySQL database service with persistence
- Optional Traefik reverse proxy for SSL termination
- Network isolation and volume management
- Scaling and load balancing support

#### `docker-start.sh`
Container startup script that:
- Validates required environment variables
- Tests database connectivity
- Starts database API service in background
- Configures and starts nginx reverse proxy
- Implements graceful shutdown handling
- Provides comprehensive logging and health checks

#### `nginx.conf`
Production nginx configuration featuring:
- Reverse proxy for API requests
- Static asset serving with optimal caching
- Security headers and CORS configuration
- Rate limiting and request size limits
- Gzip compression and performance optimizations
- Custom error pages and health check endpoints

### Testing (`tests/`)

#### `jest.config.js`
Jest test configuration for Docker components:
- Test environment setup for Node.js
- Coverage reporting and thresholds
- Module path mapping for imports
- Integration with CI/CD pipelines

#### `setup.js`
Test environment initialization:
- Environment variable configuration
- Mock implementations for external dependencies
- Global test utilities and helpers
- Console output management for clean test runs

#### Test Suites
- **`database-api.spec.js`**: Unit tests for API service core functionality
- **`database-api.integration.spec.js`**: Integration tests for HTTP endpoints
- **`database-connection-pool.integration.spec.js`**: Database connection pool tests

## Usage Guidelines

### Development Workflow

1. **Local Development**:
   ```bash
   # Copy environment template
   cp docker/config/.env.example docker/config/.env

   # Edit configuration
   vim docker/config/.env

   # Run tests
   npm test -- --config docker/tests/jest.config.js
   ```

2. **Building Container**:
   ```bash
   # Build from project root
   docker build -f docker/Dockerfile -t keira3:latest .
   ```

3. **Running with Docker Compose**:
   ```bash
   # Copy compose template
   cp docker/config/docker-compose.example.yml docker-compose.yml

   # Edit configuration
   vim docker-compose.yml

   # Deploy stack
   docker-compose up -d
   ```

### File Organization Principles

1. **Separation of Concerns**: Each directory has a specific purpose
   - `api/` - Application logic and business rules
   - `config/` - Deployment and runtime configuration
   - `tests/` - Quality assurance and validation

2. **Environment Isolation**: Clear separation between:
   - Development configurations (examples and templates)
   - Production configurations (secure defaults)
   - Test configurations (mocked dependencies)

3. **Security First**: All sensitive information is:
   - Externalized to environment variables
   - Documented in `.env.example`
   - Never committed to version control

4. **Maintainability**: Files are organized for:
   - Easy navigation and discovery
   - Clear dependency relationships
   - Minimal coupling between components

### Integration Points

#### With Main Application
- Angular environment configurations in `apps/keira/src/environments/`
- Shared TypeScript types in `libs/shared/constants/src/types/`
- Service integration in `libs/shared/db-layer/src/mysql.service.ts`

#### With CI/CD Pipelines
- Docker build context from project root
- Test execution via npm scripts
- Environment variable injection from CI secrets

#### With Monitoring Systems
- Health check endpoints for container orchestration
- Metrics endpoints for monitoring solutions
- Structured logging for log aggregation

## Best Practices

### File Naming
- Use kebab-case for configuration files
- Use descriptive names that indicate purpose
- Include file type in extension (`.example`, `.template`)

### Documentation
- Each directory should have clear purpose
- Configuration files should be well-commented
- Examples should be production-ready with secure defaults

### Version Control
- Never commit sensitive information
- Use `.gitignore` for environment-specific files
- Tag releases for Docker image versioning

### Testing
- Unit tests for all API endpoints
- Integration tests for database connectivity
- Performance tests for production workloads

This organized structure ensures maintainable, secure, and scalable Docker deployments while following industry best practices for containerized applications.
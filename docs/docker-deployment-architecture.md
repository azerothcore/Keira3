# Docker Deployment Architecture

## Overview

This document describes the Docker deployment architecture for Keira3, enabling web-based deployment with external MySQL database connectivity while maintaining full compatibility with the existing Electron application.

## Architecture Design

### Hybrid Architecture

Keira3 implements a hybrid architecture that supports multiple deployment environments:

- **Electron Environment**: Direct MySQL2 connection using Node.js native modules
- **Web/Docker Environment**: HTTP API proxy layer for database operations
- **Development Web**: Local development with API proxy
- **Production Docker**: Containerized deployment with external database access

### Components

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Angular App   │    │  Database API    │    │  External MySQL │
│    (Frontend)   │◄──►│   Service        │◄──►│    Database     │
│                 │    │  (Node.js/Express)│    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Docker Implementation

### Multi-Stage Dockerfile

The Docker implementation uses a multi-stage build process optimized for production deployment:

```dockerfile
# Stage 1: Build Angular application
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build:docker

# Stage 2: Production runtime
FROM node:18-alpine AS production
WORKDIR /app

# Install production dependencies for database API
COPY package*.json ./
RUN npm ci --only=production

# Copy built Angular application
COPY --from=builder /app/dist ./dist

# Copy database API service
COPY database-api.js ./
COPY database-api.types.js ./

# Create nginx configuration
RUN apk add --no-cache nginx
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Expose ports
EXPOSE 80 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start both nginx and database API
CMD ["sh", "-c", "nginx && node database-api.js"]
```

### Environment Configuration

The Docker container supports environment-based configuration:

#### Required Environment Variables

```bash
# Database Configuration
KEIRA_DATABASE_HOST=your-mysql-host
KEIRA_DATABASE_PORT=3306
KEIRA_DATABASE_USER=your-username
KEIRA_DATABASE_PASSWORD=your-password
KEIRA_DATABASE_NAME=acore_world

# API Configuration
DB_API_PORT=3001
DB_API_HOST=0.0.0.0

# Application Configuration
NODE_ENV=production
```

#### Optional Environment Variables

```bash
# Connection Pool Settings
DB_CONNECTION_LIMIT=10
DB_ACQUIRE_TIMEOUT=60000

# Logging
LOG_LEVEL=info
DEBUG=false
```

### Docker Compose Integration

The application integrates seamlessly with Docker Compose stacks:

```yaml
version: '3.8'
services:
  keira3:
    image: keira3:latest
    ports:
      - "8080:80"
      - "3001:3001"
    environment:
      KEIRA_DATABASE_HOST: mysql-server
      KEIRA_DATABASE_PORT: 3306
      KEIRA_DATABASE_USER: acore
      KEIRA_DATABASE_PASSWORD: azerothcore123
      KEIRA_DATABASE_NAME: acore_world
      DB_API_PORT: 3001
    depends_on:
      - mysql-server
    networks:
      - acore-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  mysql-server:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: azerothcore123
      MYSQL_DATABASE: acore_world
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - acore-network

volumes:
  mysql_data:

networks:
  acore-network:
    driver: bridge
```

## API Endpoints

### Database API Service

The containerized application exposes a RESTful API for database operations:

#### Base URL
```
http://localhost:3001/api/database
```

#### Endpoints

##### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-26T09:02:16.228Z"
}
```

##### Database Connection
```http
POST /api/database/connect
```

**Request Body:**
```json
{
  "config": {
    "host": "mysql-server",
    "port": 3306,
    "user": "acore",
    "password": "azerothcore123",
    "database": "acore_world"
  }
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Connected to database successfully",
  "timestamp": "2025-09-26T09:02:16.228Z"
}
```

**Error Response (401/503/500):**
```json
{
  "success": false,
  "error": "Authentication failed - check database credentials: Access denied for user",
  "category": "AUTHENTICATION",
  "code": "ER_ACCESS_DENIED_ERROR",
  "errno": 1045,
  "timestamp": "2025-09-26T09:02:16.228Z"
}
```

##### Database Query
```http
POST /api/database/query
```

**Request Body:**
```json
{
  "sql": "SELECT * FROM creature_template WHERE entry = ?",
  "params": [1]
}
```

**Success Response (200):**
```json
{
  "success": true,
  "result": [
    {
      "entry": 1,
      "name": "Test Creature",
      "subname": "Test"
    }
  ],
  "fields": [
    {
      "name": "entry",
      "type": 3
    },
    {
      "name": "name",
      "type": 253
    }
  ],
  "metadata": {
    "executionTime": 15,
    "rowCount": 1,
    "query": "SELECT * FROM creature_template WHERE entry = ?",
    "parameters": [1],
    "timestamp": "2025-09-26T09:02:16.228Z"
  }
}
```

**Error Response (400/404/422/503):**
```json
{
  "success": false,
  "error": "SQL syntax error in query: You have an error in your SQL syntax",
  "category": "SYNTAX",
  "code": "ER_PARSE_ERROR",
  "errno": 1064,
  "timestamp": "2025-09-26T09:02:16.228Z"
}
```

##### Connection State
```http
GET /api/database/state
```

**Response:**
```json
{
  "state": "CONNECTED",
  "timestamp": "2025-09-26T09:02:16.228Z",
  "poolInfo": {
    "totalConnections": 2,
    "freeConnections": 1,
    "acquiringConnections": 0
  }
}
```

### Frontend API Integration

The Angular frontend automatically detects the deployment environment and uses the appropriate database connection method:

#### Environment Detection
```typescript
export interface KeiraAppConfig {
  readonly production: boolean;
  readonly environment: KeiraEnvironment;
  readonly sqlitePath: string;
  readonly sqliteItem3dPath: string;
  readonly databaseApiUrl?: string;
}
```

#### Docker Environment Configuration
```typescript
export const KEIRA_APP_CONFIG = {
  production: true,
  environment: 'DOCKER',
  sqlitePath: 'assets/sqlite.db',
  sqliteItem3dPath: 'assets/item_display.db',
  databaseApiUrl: '/api/database'
};
```

## Network Architecture

### Internal Container Communication

```
┌─────────────────┐ Port 80  ┌─────────────────┐ Port 3001 ┌─────────────────┐
│     nginx       │◄────────►│   Angular App   │◄─────────►│ Database API    │
│  (Reverse Proxy)│          │   (Static Files)│           │ (Node.js/Express)│
└─────────────────┘          └─────────────────┘           └─────────────────┘
         │                                                           │
         │                                                           │
         ▼                                                           ▼
┌─────────────────┐                                         ┌─────────────────┐
│   Port 80       │                                         │  External MySQL │
│  (External)     │                                         │    Database     │
└─────────────────┘                                         └─────────────────┘
```

### nginx Reverse Proxy Configuration

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    upstream api_backend {
        server localhost:3001;
    }

    server {
        listen 80;
        server_name _;

        # Serve Angular static files
        location / {
            root /app/dist/keira;
            try_files $uri $uri/ /index.html;
            add_header Cache-Control "public, max-age=31536000";
        }

        # Proxy API requests to Node.js backend
        location /api/ {
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Health check endpoint
        location /health {
            proxy_pass http://api_backend/health;
        }
    }
}
```

## Deployment Strategies

### Standalone Docker Container

```bash
# Build container
docker build -t keira3:latest .

# Run with environment variables
docker run -d \
  --name keira3 \
  -p 8080:80 \
  -p 3001:3001 \
  -e KEIRA_DATABASE_HOST=your-mysql-host \
  -e KEIRA_DATABASE_USER=your-username \
  -e KEIRA_DATABASE_PASSWORD=your-password \
  -e KEIRA_DATABASE_NAME=acore_world \
  keira3:latest
```

### Docker Compose Stack Integration

```bash
# Deploy with existing stack
docker-compose -f docker-compose.yml -f keira3-addon.yml up -d

# Scale and update
docker-compose up -d --scale keira3=2
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: keira3
spec:
  replicas: 2
  selector:
    matchLabels:
      app: keira3
  template:
    metadata:
      labels:
        app: keira3
    spec:
      containers:
      - name: keira3
        image: keira3:latest
        ports:
        - containerPort: 80
        - containerPort: 3001
        env:
        - name: KEIRA_DATABASE_HOST
          value: "mysql-service"
        - name: KEIRA_DATABASE_USER
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: username
        - name: KEIRA_DATABASE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mysql-secret
              key: password
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: keira3-service
spec:
  selector:
    app: keira3
  ports:
  - name: web
    port: 80
    targetPort: 80
  - name: api
    port: 3001
    targetPort: 3001
  type: LoadBalancer
```

## Security Considerations

### Database Security

1. **Connection Credentials**: Store database credentials in environment variables or secrets
2. **Network Isolation**: Use private networks for database communication
3. **Connection Pooling**: Limit concurrent database connections
4. **SQL Injection Protection**: Use parameterized queries exclusively

### Container Security

1. **Non-Root User**: Run container processes as non-root user
2. **Minimal Base Image**: Use Alpine Linux for reduced attack surface
3. **Health Checks**: Implement comprehensive health monitoring
4. **Resource Limits**: Set appropriate memory and CPU limits

```dockerfile
# Add non-root user
RUN addgroup -g 1001 -S keira && \
    adduser -S keira -u 1001 -G keira

# Set resource limits
USER keira
```

### Network Security

1. **Reverse Proxy**: Use nginx as reverse proxy for security headers
2. **HTTPS Termination**: Handle SSL/TLS at load balancer level
3. **CORS Configuration**: Properly configure Cross-Origin Resource Sharing
4. **Rate Limiting**: Implement API rate limiting

## Monitoring and Logging

### Health Monitoring

```javascript
// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: 'unknown'
  };

  try {
    if (connectionPool) {
      const connection = await connectionPool.getConnection();
      await connection.ping();
      connection.release();
      health.database = 'connected';
    } else {
      health.database = 'disconnected';
    }
  } catch (error) {
    health.status = 'unhealthy';
    health.database = 'error';
    health.error = error.message;
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

### Logging Configuration

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});
```

### Metrics Collection

```javascript
// Prometheus metrics endpoint
const promClient = require('prom-client');
const collectDefaultMetrics = promClient.collectDefaultMetrics;

collectDefaultMetrics({ timeout: 5000 });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(promClient.register.metrics());
});
```

## Performance Optimization

### Database Connection Pooling

```javascript
const poolConfig = {
  host: process.env.KEIRA_DATABASE_HOST,
  port: parseInt(process.env.KEIRA_DATABASE_PORT || '3306'),
  user: process.env.KEIRA_DATABASE_USER,
  password: process.env.KEIRA_DATABASE_PASSWORD,
  database: process.env.KEIRA_DATABASE_NAME,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'),
  timeout: parseInt(process.env.DB_TIMEOUT || '60000'),
  multipleStatements: true
};
```

### Caching Strategy

```nginx
# Static asset caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# API response caching
location /api/database/state {
    proxy_pass http://api_backend;
    proxy_cache_valid 200 30s;
    add_header X-Cache-Status $upstream_cache_status;
}
```

## Troubleshooting

### Common Issues

1. **Database Connection Failures**
   - Check environment variables
   - Verify network connectivity
   - Confirm database credentials

2. **Container Startup Issues**
   - Review Docker logs: `docker logs keira3`
   - Check health endpoint: `curl http://localhost:3001/health`
   - Verify port availability

3. **API Request Failures**
   - Check nginx proxy configuration
   - Verify API endpoint availability
   - Review request/response headers

### Debug Commands

```bash
# Container inspection
docker inspect keira3

# Log monitoring
docker logs -f keira3

# Network debugging
docker network ls
docker network inspect bridge

# Health check testing
curl -i http://localhost:3001/health
curl -i http://localhost:80/api/database/state
```

This architecture provides a robust, scalable, and secure deployment solution for Keira3 while maintaining full compatibility with existing Electron deployments.
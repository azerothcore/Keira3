# Multi-stage Docker build for Keira3
# Stage 1: Build stage
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Install build dependencies for native modules
# hadolint ignore=DL3018
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite \
    sqlite-dev

# Copy package files
COPY package*.json ./

# Install all dependencies and Docker-specific runtime dependencies
RUN npm ci --ignore-scripts && \
    npm install express@4.21.2

# Copy source code
COPY . .

# Build the application for Docker deployment (using docker config)
RUN npm run build -- -c docker

# Stage 2: Production stage
FROM nginx:alpine AS production

# Install Node.js runtime, bash, and debugging tools
# hadolint ignore=DL3018
RUN apk add --no-cache nodejs npm bash netcat-openbsd curl net-tools

# Set working directory
WORKDIR /app

# Create nginx user for running the application
RUN addgroup -g 1001 -S keira && \
    adduser -S keira -u 1001

# Copy built application from builder stage
COPY --from=builder --chown=keira:keira /app/dist/browser /usr/share/nginx/html

# Copy database API service from new location
COPY --from=builder --chown=keira:keira /app/docker/api/database-api.js /app/database-api.js
COPY --from=builder --chown=keira:keira /app/node_modules /app/node_modules

# Copy nginx configuration and startup script
COPY --chown=keira:keira docker/config/nginx.conf /etc/nginx/nginx.conf
COPY --chown=keira:keira docker/config/docker-start.sh /usr/local/bin/docker-start.sh

# Create directories for logs and temp files with proper permissions
RUN mkdir -p /var/log/nginx /var/lib/nginx/tmp /var/cache/nginx \
    /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp \
    /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp \
    /var/cache/nginx/scgi_temp && \
    chown -R keira:keira /var/log/nginx /var/lib/nginx /var/cache/nginx /etc/nginx && \
    chmod +x /usr/local/bin/docker-start.sh

# Expose ports
EXPOSE 8080 3001

# Environment variables for configuration
ENV NODE_ENV=production
ENV KEIRA_PORT=8080
ENV KEIRA_HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://127.0.0.1:8080/health || exit 1

# Keep running as root for simplified deployment
# USER keira

# Start nginx using the startup script
CMD ["/bin/sh", "/usr/local/bin/docker-start.sh"]

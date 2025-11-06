#!/bin/bash

# Keira3 Docker Startup Script
# This script starts both nginx and the database API service

set -e

echo "Starting Keira3 Docker Container..."

# Function to handle shutdown gracefully
shutdown_handler() {
    echo "Received shutdown signal, stopping services..."
    if [ ! -z "$API_PID" ]; then
        kill -TERM "$API_PID" 2>/dev/null || true
    fi
    if [ ! -z "$NGINX_PID" ]; then
        kill -TERM "$NGINX_PID" 2>/dev/null || true
    fi
    exit 0
}

# Set up signal handlers
trap shutdown_handler SIGTERM SIGINT SIGQUIT

# Validate required environment variables
if [ -z "$KEIRA_DATABASE_HOST" ]; then
    echo "ERROR: KEIRA_DATABASE_HOST environment variable is required"
    exit 1
fi

if [ -z "$KEIRA_DATABASE_USER" ]; then
    echo "ERROR: KEIRA_DATABASE_USER environment variable is required"
    exit 1
fi

if [ -z "$KEIRA_DATABASE_PASSWORD" ]; then
    echo "ERROR: KEIRA_DATABASE_PASSWORD environment variable is required"
    exit 1
fi

# Set default values for optional environment variables
export KEIRA_DATABASE_PORT=${KEIRA_DATABASE_PORT:-3306}
export KEIRA_DATABASE_NAME=${KEIRA_DATABASE_NAME:-acore_world}
export DB_API_PORT=${DB_API_PORT:-3001}
export DB_API_HOST=${DB_API_HOST:-0.0.0.0}
export NODE_ENV=${NODE_ENV:-production}

echo "Configuration:"
echo "  Database Host: $KEIRA_DATABASE_HOST"
echo "  Database Port: $KEIRA_DATABASE_PORT"
echo "  Database User: $KEIRA_DATABASE_USER"
echo "  Database Name: $KEIRA_DATABASE_NAME"
echo "  API Port: $DB_API_PORT"
echo "  Node Environment: $NODE_ENV"

# Test database connectivity (optional, with timeout)
echo "Testing database connectivity..."
if command -v nc >/dev/null 2>&1; then
    if ! timeout 10s nc -z "$KEIRA_DATABASE_HOST" "$KEIRA_DATABASE_PORT"; then
        echo "WARNING: Cannot connect to database at $KEIRA_DATABASE_HOST:$KEIRA_DATABASE_PORT"
        echo "The application will continue to start but database operations may fail"
    else
        echo "Database connectivity test passed"
    fi
else
    echo "Netcat not available, skipping database connectivity test"
fi

# Create necessary directories
mkdir -p /var/log/nginx /tmp/nginx

# Start the database API service in the background
echo "Starting Database API service on port $DB_API_PORT..."
cd /app
echo "Current directory: $(pwd)"
echo "Files in /app:"
ls -la /app/
echo "Checking if database-api.js exists:"
[ -f database-api.js ] && echo "✅ database-api.js found" || echo "❌ database-api.js NOT found"
echo "Starting Node.js API service..."
# Capture any startup errors
node database-api.js > /tmp/api-startup.log 2>&1 &
API_PID=$!
echo "Node.js command executed, waiting for startup..."
sleep 2
echo "API startup log:"
cat /tmp/api-startup.log 2>/dev/null || echo "No startup log found"
echo "API service started with PID: $API_PID"
sleep 1
echo "Checking if API process is still running..."
if kill -0 "$API_PID" 2>/dev/null; then
    echo "✅ API process is running (PID: $API_PID)"
else
    echo "❌ API process died immediately!"
    echo "Checking for any Node.js errors in container logs..."
fi

# Wait for API service to be ready with proper health checking
echo "Waiting for Database API service to be ready..."
i=1
while [ $i -le 30 ]; do
    # Check if process is still running
    if ! kill -0 "$API_PID" 2>/dev/null; then
        echo "ERROR: Database API service process died"
        exit 1
    fi

    # Test health endpoint with detailed logging
    if command -v wget >/dev/null 2>&1; then
        echo "Testing health endpoint: http://localhost:$DB_API_PORT/health"
        if timeout 5s wget --spider --quiet "http://localhost:$DB_API_PORT/health" 2>/dev/null; then
            echo "✅ Database API service is ready (PID: $API_PID)"
            break
        else
            echo "❌ Health check failed, checking API service status..."
            # Check if port is listening
            if command -v netstat >/dev/null 2>&1; then
                echo "Port status:"
                netstat -tulpn | grep ":$DB_API_PORT" || echo "Port $DB_API_PORT not found in netstat"
            fi
            # Try direct curl if available for more verbose output
            if command -v curl >/dev/null 2>&1; then
                echo "Trying curl for API health check:"
                if timeout 5s curl -f -s "http://localhost:$DB_API_PORT/health" >/dev/null 2>&1; then
                    echo "✅ API health check succeeded with curl!"
                    break
                else
                    echo "Curl to API health endpoint also failed"
                fi
            fi
        fi
    fi

    if [ $i -eq 30 ]; then
        echo "WARNING: API service health check failed after 30 attempts, but continuing startup"
        echo "Process is running (PID: $API_PID) but health endpoint may not be responding"
        break
    fi

    echo "Waiting for API service... attempt $i/30"
    sleep 2
    i=$((i + 1))
done

# Start nginx in the foreground
echo "Starting nginx on port ${KEIRA_PORT:-8080}..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for nginx to be ready
echo "Waiting for nginx to be ready..."
i=1
while [ $i -le 15 ]; do
    # Check if process is still running
    if ! kill -0 "$NGINX_PID" 2>/dev/null; then
        echo "ERROR: nginx process died"
        kill -TERM "$API_PID" 2>/dev/null || true
        exit 1
    fi

    # Test nginx health endpoint with detailed logging
    if command -v wget >/dev/null 2>&1; then
        echo "Testing nginx health endpoint: http://localhost:${KEIRA_PORT:-8080}/health"
        if timeout 5s wget --spider --quiet "http://localhost:${KEIRA_PORT:-8080}/health" 2>/dev/null; then
            echo "✅ nginx and application are ready!"
            break
        else
            echo "❌ nginx health check failed, checking status..."
            # Check if port is listening
            if command -v netstat >/dev/null 2>&1; then
                echo "nginx port status:"
                netstat -tulpn | grep ":${KEIRA_PORT:-8080}" || echo "Port ${KEIRA_PORT:-8080} not found in netstat"
            fi
            # Try direct curl for more verbose output
            if command -v curl >/dev/null 2>&1; then
                echo "Trying curl for nginx health check:"
                if timeout 5s curl -f -s "http://localhost:${KEIRA_PORT:-8080}/health" >/dev/null 2>&1; then
                    echo "✅ nginx health check succeeded with curl!"
                    break
                else
                    echo "Curl to nginx health endpoint also failed"
                fi
            fi
        fi
    fi

    if [ $i -eq 15 ]; then
        echo "WARNING: nginx health check failed after 15 attempts"
        echo "nginx is running (PID: $NGINX_PID) but health endpoint may not be responding"
        break
    fi

    echo "Waiting for nginx... attempt $i/15"
    sleep 2
    i=$((i + 1))
done

echo "Keira3 Docker container startup complete"
echo "Application available at http://localhost:${KEIRA_PORT:-8080}"
echo "API available at http://localhost:$DB_API_PORT"

# Wait for processes to complete
wait $NGINX_PID $API_PID
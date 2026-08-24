#!/bin/sh
set -e

# Docker startup script for Keira3

echo "Starting Keira3 container..."

# Environment variable validation
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV=production
fi

if [ -z "$KEIRA_PORT" ]; then
    export KEIRA_PORT=8080
fi

# Display configuration
echo "Configuration:"
echo "  NODE_ENV: $NODE_ENV"
echo "  KEIRA_PORT: $KEIRA_PORT"
echo "  KEIRA_HOST: ${KEIRA_HOST:-0.0.0.0}"

# Check if database configuration is provided
if [ ! -z "$KEIRA_DATABASE_HOST" ]; then
    echo "  Database Host: $KEIRA_DATABASE_HOST"
    echo "  Database Port: ${KEIRA_DATABASE_PORT:-3306}"
    echo "  Database Name: ${KEIRA_DATABASE_NAME:-acore_world}"
fi

# Wait for database if DATABASE_HOST is provided
if [ ! -z "$KEIRA_DATABASE_HOST" ]; then
    echo "Waiting for database connection..."
    timeout=60
    while ! nc -z "$KEIRA_DATABASE_HOST" "${KEIRA_DATABASE_PORT:-3306}"; do
        sleep 1
        timeout=$((timeout - 1))
        if [ $timeout -eq 0 ]; then
            echo "ERROR: Database connection timeout"
            exit 1
        fi
    done
    echo "Database connection established"
fi

# Start database API service if database configuration is provided
if [ ! -z "$KEIRA_DATABASE_HOST" ]; then
    echo "Starting database API service..."
    export DB_API_PORT=3001
    cd /app
    node database-api.js &
    DB_API_PID=$!
    echo "Database API service started with PID: $DB_API_PID"

    # Wait a moment for the API to start
    sleep 2
fi

# Create a function to handle shutdown
shutdown() {
    echo "Shutting down services..."
    if [ ! -z "$DB_API_PID" ]; then
        echo "Stopping database API service..."
        kill $DB_API_PID 2>/dev/null || true
        wait $DB_API_PID 2>/dev/null || true
    fi
    echo "Stopping nginx..."
    nginx -s quit
    exit 0
}

# Trap signals for graceful shutdown
trap shutdown SIGTERM SIGINT

# Start nginx
echo "Starting nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for nginx to finish
wait $NGINX_PID
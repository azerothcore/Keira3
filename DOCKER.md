# Keira3 Docker Deployment Guide

This guide explains how to deploy Keira3 using Docker Compose, integrated with the acore-compose infrastructure.

## Overview

Keira3 is deployed as a single containerized service that connects to the shared AzerothCore MySQL database. The application consists of:

- **Nginx web server** (port 8080) - Serves the Angular frontend
- **Database API** (port 3001) - Express.js service for MySQL connections
- **Angular SPA** - The Keira3 editor interface

## Prerequisites

1. **Docker and Docker Compose** installed
2. **acore-compose MySQL service** must be running:
   ```bash
   cd ~/src/acore-compose
   docker-compose --profile db up -d
   ```
3. The **azerothcore network** must exist (created by acore-compose)

## Quick Start

You have two deployment options:

### Option 1: Using Pre-built DockerHub Image (Recommended)

This is the fastest and easiest way to get started.

#### 1. Copy the example compose file

```bash
cd ~/src/Keira3
cp docker-compose.example.yml docker-compose.yml
```

#### 2. Enable DockerHub image

Edit `docker-compose.yml` and make these changes:

```yaml
keira3:
  # Uncomment this line:
  image: uprightbass360/keira3:latest

  # Comment out the build section:
  # build:
  #   context: .
  #   dockerfile: docker/Dockerfile
  #   target: production
  # image: keira3:latest
```

#### 3. Update database password

Edit the `KEIRA_DATABASE_PASSWORD` to match your acore-compose MySQL password:

```yaml
environment:
  KEIRA_DATABASE_PASSWORD: password      # CHANGE THIS!
```

#### 4. Start Keira3

```bash
docker-compose up -d
```

#### 5. Access Keira3

Open your browser and navigate to:
```
http://localhost:4201
```

---

### Option 2: Building from Source (Development)

Use this option if you want to build Keira3 locally or make modifications.

#### 1. Copy the example compose file

```bash
cd ~/src/Keira3
cp docker-compose.example.yml docker-compose.yml
```

#### 2. Keep build configuration

The default configuration in `docker-compose.example.yml` is already set up for local builds. Just ensure the build section is uncommented:

```yaml
keira3:
  build:
    context: .
    dockerfile: docker/Dockerfile
    target: production
  image: keira3:latest
```

#### 3. Update database password

Edit the `KEIRA_DATABASE_PASSWORD` to match your acore-compose MySQL password:

```yaml
environment:
  KEIRA_DATABASE_PASSWORD: password      # CHANGE THIS!
```

#### 4. Build and start Keira3

```bash
docker-compose up -d --build
```

#### 5. Access Keira3

Open your browser and navigate to:
```
http://localhost:4201
```

## Configuration Reference

### Environment Variables

All configuration is done via hardcoded environment variables in the docker-compose.yml file:

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `production` | Node.js environment |
| `KEIRA_PORT` | `8080` | Internal nginx port |
| `KEIRA_HOST` | `0.0.0.0` | Bind address |
| `KEIRA_DATABASE_HOST` | `ac-mysql` | MySQL hostname (container name) |
| `KEIRA_DATABASE_PORT` | `3306` | MySQL port |
| `KEIRA_DATABASE_USER` | `root` | MySQL username |
| `KEIRA_DATABASE_PASSWORD` | `password` | MySQL password |
| `KEIRA_DATABASE_NAME` | `acore_world` | Database name |
| `KEIRA_DB_CONNECTION_LIMIT` | `10` | Max database connections |
| `TZ` | `UTC` | Timezone |

### Port Mapping

| External Port | Internal Port | Service |
|---------------|---------------|---------|
| `4201` | `8080` | Keira3 Web UI |
| N/A | `3001` | Database API (internal only) |

### Resource Limits

**Memory:**
- Limit: 512MB
- Reservation: 256MB

**CPU:**
- Limit: 0.5 cores
- Reservation: 0.25 cores

## Network Architecture

```
┌─────────────────────────────────────────────────────┐
│                 azerothcore network                  │
│                  (172.28.0.0/16)                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐           ┌──────────────┐       │
│  │   ac-mysql   │◄──────────┤  keira3-app  │       │
│  │ (MySQL 8.0)  │           │  (Nginx +    │       │
│  │  Port: 3306  │           │   Node.js)   │       │
│  └──────────────┘           │  Port: 8080  │       │
│  (acore-compose)            └──────┬───────┘       │
│                                    │                │
└────────────────────────────────────┼────────────────┘
                                     │
                              Port Mapping: 4201:8080
                                     │
                                     ▼
                            User Browser
                        http://localhost:4201
```

## Docker Commands

### Start Keira3
```bash
docker-compose up -d
```

### Stop Keira3
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f keira3
```

### Rebuild and restart
```bash
docker-compose up -d --build
```

### Check service health
```bash
docker-compose ps
```

### Access container shell
```bash
docker exec -it keira3-app /bin/bash
```

## Health Checks

Keira3 includes built-in health checks:

- **Endpoint:** `http://localhost:8080/health`
- **Interval:** 30 seconds
- **Timeout:** 10 seconds
- **Retries:** 3
- **Start Period:** 40 seconds

Check health status:
```bash
docker inspect keira3-app | grep -A 10 Health
```

## Troubleshooting

### Cannot connect to MySQL

**Symptom:** Keira3 fails to connect to the database

**Solution:**
1. Verify ac-mysql container is running:
   ```bash
   docker ps | grep ac-mysql
   ```
2. Check network connectivity:
   ```bash
   docker exec keira3-app nc -zv ac-mysql 3306
   ```
3. Verify database credentials in docker-compose.yml match acore-compose settings

### Port 4201 already in use

**Symptom:** Error: "port is already allocated"

**Solution:**
1. Change the external port in docker-compose.yml:
   ```yaml
   ports:
     - "8080:8080"  # Or any available port
   ```
2. Access Keira3 at the new port

### Database API not responding

**Symptom:** Frontend loads but cannot connect to database

**Solution:**
1. Check if database API is running:
   ```bash
   docker exec keira3-app netstat -tulpn | grep 3001
   ```
2. Review database API logs:
   ```bash
   docker-compose logs keira3 | grep database-api
   ```

### Container keeps restarting

**Symptom:** Container status shows "Restarting"

**Solution:**
1. Check container logs:
   ```bash
   docker-compose logs keira3
   ```
2. Verify all required environment variables are set
3. Check if azerothcore network exists:
   ```bash
   docker network ls | grep azerothcore
   ```

## Integration with acore-compose

### Recommended Startup Order

1. **Start acore-compose database:**
   ```bash
   cd ~/src/acore-compose
   docker-compose --profile db up -d
   ```

2. **Wait for MySQL to be healthy:**
   ```bash
   docker ps | grep ac-mysql
   # Look for "healthy" status
   ```

3. **Start Keira3:**
   ```bash
   cd ~/src/Keira3
   docker-compose up -d
   ```

### Using with Full acore-compose Stack

If you're running the full AzerothCore server stack:

```bash
# Start everything in acore-compose
cd ~/src/acore-compose
docker-compose --profile db --profile services-standard up -d

# Start Keira3
cd ~/src/Keira3
docker-compose up -d
```

### Accessing Other Databases

To connect to different databases, modify the `KEIRA_DATABASE_NAME` variable:

```yaml
KEIRA_DATABASE_NAME: acore_characters  # For characters database
KEIRA_DATABASE_NAME: acore_auth        # For auth database
```

## Production Deployment

For production deployments, consider:

1. **Use stronger passwords** - Change all default passwords
2. **Enable HTTPS** - Use a reverse proxy (nginx/Caddy) with SSL
3. **Increase resource limits** - Based on your server capacity
4. **Set up backups** - Regular database backups via acore-compose
5. **Monitor logs** - Set up log aggregation (ELK stack, etc.)
6. **Network isolation** - Restrict access to internal network only

## Additional Resources

- **acore-compose repository:** `~/src/acore-compose`
- **Keira3 documentation:** https://github.com/azerothcore/Keira3
- **AzerothCore wiki:** https://www.azerothcore.org/wiki/

# Keira3 Docker with External Database Support

This solution enables Keira3 to run in a Docker container with full external MySQL database connectivity, maintaining all existing Electron functionality while adding web deployment capabilities.

## 🎯 Solution Overview

The implementation uses a **hybrid architecture** that supports both environments:

- **Electron Environment**: Direct mysql2 connections (existing functionality preserved)
- **Web/Docker Environment**: HTTP API proxy for database operations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular App   │    │  Database API   │    │  External       │
│   (Frontend)    │◄──►│   (Node.js)     │◄──►│  MySQL Database │
│   Port 8080     │    │   Port 3001     │    │   Port 3306     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         └───────────────────────┘
              nginx proxy
```

## 🚀 Key Features

### ✅ **Minimal Changes**
- Existing Electron functionality **fully preserved**
- Zero breaking changes to current codebase
- Automatic environment detection

### ✅ **External Database Support**
- Connects to any external MySQL database
- Environment variable configuration
- Connection pooling and error handling

### ✅ **Production Ready**
- Multi-stage Docker build
- Security hardened nginx
- Health checks and graceful shutdown
- Resource limits and logging

## 📦 Components Added

### 1. Database API Service (`database-api.js`)
- **Lightweight Express.js server** that runs alongside the Angular app
- **mysql2 connection pooling** for reliable database access
- **HTTP API endpoints** that mirror mysql2 interface:
  - `POST /api/database/connect` - Establish database connection
  - `POST /api/database/query` - Execute SQL queries
  - `GET /api/database/state` - Check connection status

### 2. Enhanced MysqlService
- **Environment detection** - automatically chooses connection method
- **Dual implementation**:
  - Electron: Direct mysql2 (existing)
  - Web: HTTP API calls (new)
- **Transparent interface** - same API for both environments

### 3. Updated Configuration
- **Extended KeiraAppConfig** with `databaseApiUrl` option
- **Environment-specific configs** for Docker deployment
- **nginx proxy** for seamless API integration

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `KEIRA_DATABASE_HOST` | MySQL host address | `localhost` | ✅ |
| `KEIRA_DATABASE_PORT` | MySQL port | `3306` | No |
| `KEIRA_DATABASE_USER` | MySQL username | `root` | ✅ |
| `KEIRA_DATABASE_PASSWORD` | MySQL password | - | ✅ |
| `KEIRA_DATABASE_NAME` | Database name | `acore_world` | ✅ |

### Docker Compose Example

```yaml
version: '3.8'

services:
  keira3:
    image: keira3:latest
    ports:
      - "4201:8080"
    environment:
      - KEIRA_DATABASE_HOST=your-mysql-host
      - KEIRA_DATABASE_PORT=3306
      - KEIRA_DATABASE_USER=acore
      - KEIRA_DATABASE_PASSWORD=your-password
      - KEIRA_DATABASE_NAME=acore_world
    restart: unless-stopped
```

## 🛠️ Usage

### Build Docker Image
```bash
docker build -t keira3:latest .
```

### Deploy with External Database
```bash
# Set your database credentials
export DATABASE_HOST=your-mysql-host.com
export DATABASE_USER=acore
export DATABASE_PASSWORD=your-secure-password
export DATABASE_NAME=acore_world

# Deploy with docker-compose
docker-compose up -d
```

### Development Testing
```bash
# Use the test configuration with local MySQL
docker-compose -f docker-compose.test.yml up -d

# Access the application
open http://localhost:4202
```

## ✅ Testing & Verification

### Health Checks
```bash
# Application health
curl http://localhost:4201/health

# Database connection status
curl http://localhost:4201/api/database/state
```

### Connection Testing
The application will automatically:
1. Wait for database connectivity on startup
2. Initialize connection pool
3. Provide real-time connection status
4. Handle connection errors gracefully

## 🔄 Environment Compatibility

| Environment | Database Connection | Status |
|-------------|-------------------|--------|
| **Electron Desktop** | Direct mysql2 | ✅ **Preserved** |
| **Docker Web** | HTTP API Proxy | ✅ **New Feature** |
| **Development Web** | HTTP API Proxy | ✅ **Supported** |

## 📋 Migration Guide

### For Existing Users
**No changes required** - Electron functionality remains identical.

### For Docker Deployment
1. **Build the image**: `docker build -t keira3 .`
2. **Set environment variables** for your MySQL database
3. **Deploy**: `docker-compose up -d`
4. **Access**: `http://localhost:4201`

## 🔍 Troubleshooting

### Database Connection Issues
```bash
# Check container logs
docker-compose logs keira3

# Verify database connectivity
docker exec -it keira3-app nc -z $DATABASE_HOST $DATABASE_PORT
```

### API Service Status
```bash
# Check if database API is running
curl http://localhost:4201/api/database/state

# Expected response: {"state":"CONNECTED"}
```

## 🎉 Benefits

1. **✅ Backward Compatible** - All existing functionality preserved
2. **✅ External Database Ready** - Connect to any MySQL database
3. **✅ Production Scalable** - Resource limits, health checks, logging
4. **✅ Security Hardened** - nginx proxy, non-root execution
5. **✅ Development Friendly** - Easy testing and deployment

## 📞 Support

The solution maintains 100% compatibility with existing Keira3 functionality while adding powerful Docker deployment capabilities. The hybrid architecture ensures that whether you're running in Electron or Docker, you get the same reliable database connectivity.

---

**🚀 Ready for production deployment with external database connectivity!**
#!/usr/bin/env node

/**
 * Lightweight Database API Service for Keira3
 * Provides HTTP API interface for MySQL database operations
 * Runs alongside the Angular app in Docker container
 */

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

// Enhanced error handling system
const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

const ERROR_CATEGORIES = {
  AUTHENTICATION: 'AUTHENTICATION',
  CONNECTION: 'CONNECTION',
  SYNTAX: 'SYNTAX',
  CONSTRAINT: 'CONSTRAINT',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL: 'INTERNAL',
  VALIDATION: 'VALIDATION',
};

// MySQL error code to HTTP status mapping
const MYSQL_ERROR_MAPPING = {
  ER_ACCESS_DENIED_ERROR: { status: HTTP_STATUS.UNAUTHORIZED, category: ERROR_CATEGORIES.AUTHENTICATION },
  ER_DBACCESS_DENIED_ERROR: { status: HTTP_STATUS.FORBIDDEN, category: ERROR_CATEGORIES.AUTHENTICATION },
  ER_BAD_DB_ERROR: { status: HTTP_STATUS.NOT_FOUND, category: ERROR_CATEGORIES.NOT_FOUND },
  ER_NO_SUCH_TABLE: { status: HTTP_STATUS.NOT_FOUND, category: ERROR_CATEGORIES.NOT_FOUND },
  ER_BAD_FIELD_ERROR: { status: HTTP_STATUS.NOT_FOUND, category: ERROR_CATEGORIES.NOT_FOUND },
  ER_PARSE_ERROR: { status: HTTP_STATUS.BAD_REQUEST, category: ERROR_CATEGORIES.SYNTAX },
  ER_SYNTAX_ERROR: { status: HTTP_STATUS.BAD_REQUEST, category: ERROR_CATEGORIES.SYNTAX },
  ER_DUP_ENTRY: { status: HTTP_STATUS.UNPROCESSABLE_ENTITY, category: ERROR_CATEGORIES.CONSTRAINT },
  ER_ROW_IS_REFERENCED: { status: HTTP_STATUS.UNPROCESSABLE_ENTITY, category: ERROR_CATEGORIES.CONSTRAINT },
  ER_ROW_IS_REFERENCED_2: { status: HTTP_STATUS.UNPROCESSABLE_ENTITY, category: ERROR_CATEGORIES.CONSTRAINT },
  ER_NO_REFERENCED_ROW: { status: HTTP_STATUS.UNPROCESSABLE_ENTITY, category: ERROR_CATEGORIES.CONSTRAINT },
  ER_NO_REFERENCED_ROW_2: { status: HTTP_STATUS.UNPROCESSABLE_ENTITY, category: ERROR_CATEGORIES.CONSTRAINT },
  PROTOCOL_CONNECTION_LOST: { status: HTTP_STATUS.SERVICE_UNAVAILABLE, category: ERROR_CATEGORIES.CONNECTION },
  ECONNREFUSED: { status: HTTP_STATUS.SERVICE_UNAVAILABLE, category: ERROR_CATEGORIES.CONNECTION },
  ENOTFOUND: { status: HTTP_STATUS.SERVICE_UNAVAILABLE, category: ERROR_CATEGORIES.CONNECTION },
  ETIMEDOUT: { status: HTTP_STATUS.SERVICE_UNAVAILABLE, category: ERROR_CATEGORIES.CONNECTION },
  ECONNRESET: { status: HTTP_STATUS.SERVICE_UNAVAILABLE, category: ERROR_CATEGORIES.CONNECTION },
};

/**
 * Enhanced error response creator with proper HTTP status codes
 * @param {Error} error - The original error
 * @param {string} [message] - Custom error message
 * @returns {Object} Structured error response
 */
function createEnhancedErrorResponse(error, message) {
  const errorCode = error.code || 'UNKNOWN_ERROR';
  const mapping = MYSQL_ERROR_MAPPING[errorCode] || {
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    category: ERROR_CATEGORIES.INTERNAL,
  };

  const response = {
    success: false,
    error: message || error.message || 'An unexpected error occurred',
    category: mapping.category,
    timestamp: new Date().toISOString(),
  };

  // Add MySQL-specific error details when available
  if (error.code) response.code = error.code;
  if (error.errno) response.errno = error.errno;
  if (error.sqlState) response.sqlState = error.sqlState;
  if (error.sqlMessage) response.sqlMessage = error.sqlMessage;

  return {
    status: mapping.status,
    response: response,
  };
}

/**
 * Validation error response creator
 * @param {string} message - Validation error message
 * @param {Object} [details] - Additional validation details
 * @returns {Object} Validation error response
 */
function createValidationError(message, details = {}) {
  return {
    status: HTTP_STATUS.BAD_REQUEST,
    response: {
      success: false,
      error: message,
      category: ERROR_CATEGORIES.VALIDATION,
      details: details,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Express error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
function errorHandler(err, req, res, next) {
  console.error('Database API Error:', {
    message: err.message,
    code: err.code,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const { status, response } = createEnhancedErrorResponse(err);
  res.status(status).json(response);
}

const app = express();
const PORT = process.env.DB_API_PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors());

// Request validation middleware
app.use('/api/database', (req, res, next) => {
  // Add request timestamp for logging
  req.timestamp = new Date().toISOString();
  next();
});

// Global connection pool
let connectionPool = null;

// Database configuration from environment variables
const getDatabaseConfig = () => ({
  host: process.env.KEIRA_DATABASE_HOST || 'localhost',
  port: parseInt(process.env.KEIRA_DATABASE_PORT || '3306'),
  user: process.env.KEIRA_DATABASE_USER || 'root',
  password: process.env.KEIRA_DATABASE_PASSWORD || '',
  database: process.env.KEIRA_DATABASE_NAME || 'acore_world',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
  multipleStatements: true,
  // Valid MySQL2 pool options
  waitForConnections: true,
  queueLimit: 0,
});

// Initialize connection pool
async function initializeDatabase() {
  try {
    const config = getDatabaseConfig();
    console.log('Connecting to database:', {
      host: config.host,
      port: config.port,
      user: config.user,
      database: config.database,
    });

    connectionPool = mysql.createPool(config);

    // Test connection
    const connection = await connectionPool.getConnection();
    await connection.ping();
    connection.release();

    console.log('Database connection pool initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error.message);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/health', (req, res) => {
  console.log(`[${new Date().toISOString()}] Health check request received from ${req.ip}`);
  const healthResponse = { status: 'healthy', timestamp: new Date().toISOString() };
  console.log(`[${new Date().toISOString()}] Health check response:`, healthResponse);
  res.json(healthResponse);
});

// Connect endpoint (mimics mysql2 connect behavior)
app.post('/api/database/connect', async (req, res, next) => {
  try {
    const { config } = req.body;

    // Validate request body
    if (!config || typeof config !== 'object') {
      const validationError = createValidationError('Connection configuration is required', {
        receivedType: typeof config,
        expected: 'object',
      });
      return res.status(validationError.status).json(validationError.response);
    }

    // Validate required config properties
    const requiredFields = ['host', 'port', 'user', 'password', 'database'];
    const missingFields = requiredFields.filter((field) => !config[field]);

    if (missingFields.length > 0) {
      const validationError = createValidationError('Missing required connection configuration fields', { missingFields, requiredFields });
      return res.status(validationError.status).json(validationError.response);
    }

    if (connectionPool) {
      const connection = await connectionPool.getConnection();
      await connection.ping();
      connection.release();

      res.json({
        success: true,
        message: 'Connected to database successfully',
        timestamp: new Date().toISOString(),
      });
    } else {
      throw new Error('Database connection pool not initialized');
    }
  } catch (error) {
    next(error);
  }
});

// Query endpoint (mimics mysql2 query behavior)
app.post('/api/database/query', async (req, res, next) => {
  try {
    const { sql, params = [] } = req.body;

    // Validate SQL query
    if (!sql || typeof sql !== 'string') {
      const validationError = createValidationError('SQL query is required and must be a string', {
        receivedType: typeof sql,
        expected: 'string',
        received: sql ? 'non-string value' : 'missing',
      });
      return res.status(validationError.status).json(validationError.response);
    }

    if (sql.trim().length === 0) {
      const validationError = createValidationError('SQL query cannot be empty', { received: 'empty string' });
      return res.status(validationError.status).json(validationError.response);
    }

    // Validate params if provided
    if (params && !Array.isArray(params)) {
      const validationError = createValidationError('Query parameters must be an array', {
        receivedType: typeof params,
        expected: 'array',
      });
      return res.status(validationError.status).json(validationError.response);
    }

    if (!connectionPool) {
      throw new Error('Database connection pool not initialized');
    }

    const connection = await connectionPool.getConnection();

    try {
      const startTime = Date.now();
      const [result, fields] = await connection.execute(sql, params);
      const executionTime = Date.now() - startTime;

      connection.release();

      // Format response to match mysql2 callback structure with enhanced metadata
      res.json({
        success: true,
        result: result,
        fields: fields,
        metadata: {
          executionTime,
          rowCount: Array.isArray(result) ? result.length : result.affectedRows || 0,
          query: sql,
          parameters: params,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (queryError) {
      connection.release();
      throw queryError;
    }
  } catch (error) {
    next(error);
  }
});

// Connection state endpoint
app.get('/api/database/state', async (req, res, next) => {
  try {
    if (connectionPool) {
      const connection = await connectionPool.getConnection();
      await connection.ping();
      connection.release();

      res.json({
        state: 'CONNECTED',
        timestamp: new Date().toISOString(),
        poolInfo: {
          totalConnections: connectionPool.pool._allConnections.length || 0,
          freeConnections: connectionPool.pool._freeConnections.length || 0,
          acquiringConnections: connectionPool.pool._acquiringConnections.length || 0,
        },
      });
    } else {
      res.json({
        state: 'DISCONNECTED',
        timestamp: new Date().toISOString(),
        error: 'Connection pool not initialized',
      });
    }
  } catch (error) {
    // For state endpoint, we want to return state info rather than throw
    res.json({
      state: 'ERROR',
      error: error.message,
      code: error.code,
      timestamp: new Date().toISOString(),
    });
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  if (connectionPool) {
    await connectionPool.end();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  if (connectionPool) {
    await connectionPool.end();
  }
  process.exit(0);
});

// Start server
async function startServer() {
  await initializeDatabase();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Database API server running on port ${PORT}`);
    console.log(`Server listening on 0.0.0.0:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Process ID: ${process.pid}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });

  server.on('error', (error) => {
    console.error('Server error:', error);
  });

  // Test health endpoint immediately after startup
  setTimeout(() => {
    console.log('Testing internal health endpoint...');
    const http = require('http');
    const req = http.get(`http://localhost:${PORT}/health`, (res) => {
      console.log(`Internal health check status: ${res.statusCode}`);
      res.on('data', (data) => {
        console.log(`Internal health check response: ${data}`);
      });
    });
    req.on('error', (err) => {
      console.error('Internal health check failed:', err.message);
    });
  }, 1000);
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

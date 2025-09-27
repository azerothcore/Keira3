/**
 * @fileoverview Strict type definitions for Node.js Database API
 * Since this is a JavaScript file, we use JSDoc for type annotations
 * These types correspond to the TypeScript definitions in database-api.ts
 */

/**
 * @typedef {Object} DatabaseConnectionConfig
 * @property {string} host - Database host
 * @property {number} port - Database port
 * @property {string} user - Database user
 * @property {string} password - Database password
 * @property {string} database - Database name
 * @property {number} [connectionLimit] - Maximum number of connections
 * @property {boolean} [multipleStatements] - Allow multiple statements
 */

/**
 * @typedef {Object} DatabaseConnectionRequest
 * @property {DatabaseConnectionConfig} config - Connection configuration
 */

/**
 * @typedef {Object} DatabaseConnectionResponse
 * @property {true} success - Success indicator
 * @property {string} message - Success message
 */

/**
 * @typedef {Object} DatabaseConnectionError
 * @property {false} success - Failure indicator
 * @property {string} error - Error message
 * @property {string} [code] - MySQL error code
 * @property {number} [errno] - MySQL error number
 * @property {string} [sqlState] - SQL state code
 * @property {string} [sqlMessage] - SQL error message
 */

/**
 * @typedef {DatabaseConnectionResponse | DatabaseConnectionError} DatabaseConnectionResult
 */

/**
 * @typedef {Object} DatabaseQueryRequest
 * @property {string} sql - SQL query string
 * @property {Array<string|number|null>} [params] - Query parameters
 */

/**
 * @typedef {Object} DatabaseQueryResponse
 * @property {true} success - Success indicator
 * @property {Array<Object>|Object} result - Query results
 * @property {Array<Object>} fields - Field metadata
 */

/**
 * @typedef {Object} DatabaseQueryError
 * @property {false} success - Failure indicator
 * @property {string} error - Error message
 * @property {string} [code] - MySQL error code
 * @property {number} [errno] - MySQL error number
 * @property {string} [sqlState] - SQL state code
 * @property {string} [sqlMessage] - SQL error message
 */

/**
 * @typedef {DatabaseQueryResponse | DatabaseQueryError} DatabaseQueryResult
 */

/**
 * @typedef {Object} DatabaseFieldInfo
 * @property {string} name - Field name
 * @property {number} [columnType] - MySQL column type
 * @property {number} [type] - Field type
 * @property {number} [flags] - Field flags
 * @property {number} [decimals] - Decimal places
 * @property {string} [encoding] - Character encoding
 * @property {number} [characterSet] - Character set ID
 */

/**
 * @typedef {Object} DatabaseStateResponse
 * @property {'CONNECTED'|'DISCONNECTED'|'CONNECTING'|'ERROR'} state - Connection state
 * @property {string} [error] - Error message if state is ERROR
 */

/**
 * @typedef {Object} ServerConfiguration
 * @property {number} port - Server port
 * @property {string} host - Server host
 * @property {Object} middleware - Middleware configuration
 * @property {boolean} middleware.cors - CORS enabled
 * @property {string} middleware.jsonLimit - JSON body limit
 * @property {boolean} middleware.urlencoded - URL encoded parsing
 */

/**
 * MySQL error codes enumeration
 * @readonly
 * @enum {string}
 */
const MYSQL_ERROR_CODES = {
  ACCESS_DENIED: 'ER_ACCESS_DENIED_ERROR',
  BAD_DB: 'ER_BAD_DB_ERROR',
  NO_SUCH_TABLE: 'ER_NO_SUCH_TABLE',
  PARSE_ERROR: 'ER_PARSE_ERROR',
  DUP_ENTRY: 'ER_DUP_ENTRY',
  CONNECTION_LOST: 'PROTOCOL_CONNECTION_LOST',
  CONN_REFUSED: 'ECONNREFUSED',
  NOT_FOUND: 'ENOTFOUND',
  TIMEOUT: 'ETIMEDOUT',
};

/**
 * Database connection states
 * @readonly
 * @enum {string}
 */
const CONNECTION_STATES = {
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  CONNECTING: 'CONNECTING',
  ERROR: 'ERROR',
};

/**
 * API endpoint paths
 * @readonly
 * @enum {string}
 */
const API_ENDPOINTS = {
  CONNECT: '/api/database/connect',
  QUERY: '/api/database/query',
  STATE: '/api/database/state',
  HEALTH: '/health',
};

/**
 * Validates a database connection request
 * @param {unknown} obj - Object to validate
 * @returns {obj is DatabaseConnectionRequest}
 */
function isDatabaseConnectionRequest(obj) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'config' in obj &&
    typeof obj.config === 'object' &&
    obj.config !== null &&
    typeof obj.config.host === 'string' &&
    typeof obj.config.port === 'number' &&
    typeof obj.config.user === 'string' &&
    typeof obj.config.password === 'string' &&
    typeof obj.config.database === 'string'
  );
}

/**
 * Validates a database query request
 * @param {unknown} obj - Object to validate
 * @returns {obj is DatabaseQueryRequest}
 */
function isDatabaseQueryRequest(obj) {
  return typeof obj === 'object' && obj !== null && 'sql' in obj && typeof obj.sql === 'string' && obj.sql.trim().length > 0;
}

/**
 * Creates a success response
 * @param {Array<Object>|Object} result - Query result
 * @param {Array<Object>} [fields] - Field metadata
 * @returns {DatabaseQueryResponse}
 */
function createSuccessResponse(result, fields = []) {
  return {
    success: true,
    result,
    fields,
  };
}

/**
 * Creates an error response
 * @param {string} error - Error message
 * @param {string} [code] - Error code
 * @param {number} [errno] - Error number
 * @param {string} [sqlState] - SQL state
 * @param {string} [sqlMessage] - SQL message
 * @returns {DatabaseQueryError}
 */
function createErrorResponse(error, code, errno, sqlState, sqlMessage) {
  const response = { success: false, error };
  if (code) response.code = code;
  if (errno) response.errno = errno;
  if (sqlState) response.sqlState = sqlState;
  if (sqlMessage) response.sqlMessage = sqlMessage;
  return response;
}

/**
 * Gets database configuration from environment variables
 * @returns {DatabaseConnectionConfig}
 */
function getDatabaseConfig() {
  return {
    host: process.env.KEIRA_DATABASE_HOST || 'localhost',
    port: parseInt(process.env.KEIRA_DATABASE_PORT || '3306', 10),
    user: process.env.KEIRA_DATABASE_USER || 'root',
    password: process.env.KEIRA_DATABASE_PASSWORD || '',
    database: process.env.KEIRA_DATABASE_NAME || 'acore_world',
    connectionLimit: 10,
    multipleStatements: true,
  };
}

/**
 * Gets server configuration from environment variables
 * @returns {ServerConfiguration}
 */
function getServerConfig() {
  return {
    port: parseInt(process.env.DB_API_PORT || '3001', 10),
    host: process.env.DB_API_HOST || '0.0.0.0',
    middleware: {
      cors: true,
      jsonLimit: '10mb',
      urlencoded: true,
    },
  };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    MYSQL_ERROR_CODES,
    CONNECTION_STATES,
    API_ENDPOINTS,
    isDatabaseConnectionRequest,
    isDatabaseQueryRequest,
    createSuccessResponse,
    createErrorResponse,
    getDatabaseConfig,
    getServerConfig,
  };
}

// Export for TypeScript declaration merging
if (typeof globalThis !== 'undefined') {
  globalThis.DatabaseApiTypes = {
    MYSQL_ERROR_CODES,
    CONNECTION_STATES,
    API_ENDPOINTS,
    isDatabaseConnectionRequest,
    isDatabaseQueryRequest,
    createSuccessResponse,
    createErrorResponse,
    getDatabaseConfig,
    getServerConfig,
  };
}

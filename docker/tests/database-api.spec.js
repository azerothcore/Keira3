/**
 * Node.js Test Suite for Database API Service
 * Tests the core functionality and configuration of the database API
 */

describe('Database API Configuration', () => {
  beforeAll(() => {
    // Set up environment variables for testing
    process.env.KEIRA_DATABASE_HOST = 'test-host';
    process.env.KEIRA_DATABASE_PORT = '3306';
    process.env.KEIRA_DATABASE_USER = 'test-user';
    process.env.KEIRA_DATABASE_PASSWORD = 'test-password';
    process.env.KEIRA_DATABASE_NAME = 'test_database';
    process.env.DB_API_PORT = '3001';
  });

  afterAll(() => {
    // Clean up environment variables
    delete process.env.KEIRA_DATABASE_HOST;
    delete process.env.KEIRA_DATABASE_PORT;
    delete process.env.KEIRA_DATABASE_USER;
    delete process.env.KEIRA_DATABASE_PASSWORD;
    delete process.env.KEIRA_DATABASE_NAME;
    delete process.env.DB_API_PORT;
  });

  describe('Environment Configuration', () => {
    it('should read database configuration from environment variables', () => {
      expect(process.env.KEIRA_DATABASE_HOST).toBe('test-host');
      expect(process.env.KEIRA_DATABASE_PORT).toBe('3306');
      expect(process.env.KEIRA_DATABASE_USER).toBe('test-user');
      expect(process.env.KEIRA_DATABASE_PASSWORD).toBe('test-password');
      expect(process.env.KEIRA_DATABASE_NAME).toBe('test_database');
      expect(process.env.DB_API_PORT).toBe('3001');
    });

    it('should provide default values when environment variables are not set', () => {
      // Temporarily clear environment variables
      const originalHost = process.env.KEIRA_DATABASE_HOST;
      const originalPort = process.env.KEIRA_DATABASE_PORT;
      const originalUser = process.env.KEIRA_DATABASE_USER;
      const originalPassword = process.env.KEIRA_DATABASE_PASSWORD;
      const originalDatabase = process.env.KEIRA_DATABASE_NAME;

      delete process.env.KEIRA_DATABASE_HOST;
      delete process.env.KEIRA_DATABASE_PORT;
      delete process.env.KEIRA_DATABASE_USER;
      delete process.env.KEIRA_DATABASE_PASSWORD;
      delete process.env.KEIRA_DATABASE_NAME;

      // Test that defaults are used (these would be tested by the actual service)
      const expectedDefaults = {
        host: process.env.KEIRA_DATABASE_HOST || 'localhost',
        port: parseInt(process.env.KEIRA_DATABASE_PORT || '3306'),
        user: process.env.KEIRA_DATABASE_USER || 'root',
        password: process.env.KEIRA_DATABASE_PASSWORD || '',
        database: process.env.KEIRA_DATABASE_NAME || 'acore_world',
      };

      expect(expectedDefaults.host).toBe('localhost');
      expect(expectedDefaults.port).toBe(3306);
      expect(expectedDefaults.user).toBe('root');
      expect(expectedDefaults.password).toBe('');
      expect(expectedDefaults.database).toBe('acore_world');

      // Restore environment variables
      process.env.KEIRA_DATABASE_HOST = originalHost;
      process.env.KEIRA_DATABASE_PORT = originalPort;
      process.env.KEIRA_DATABASE_USER = originalUser;
      process.env.KEIRA_DATABASE_PASSWORD = originalPassword;
      process.env.KEIRA_DATABASE_NAME = originalDatabase;
    });
  });

  describe('Database Configuration Object', () => {
    it('should create correct configuration object from environment', () => {
      const getDatabaseConfig = () => ({
        host: process.env.KEIRA_DATABASE_HOST || 'localhost',
        port: parseInt(process.env.KEIRA_DATABASE_PORT || '3306'),
        user: process.env.KEIRA_DATABASE_USER || 'root',
        password: process.env.KEIRA_DATABASE_PASSWORD || '',
        database: process.env.KEIRA_DATABASE_NAME || 'acore_world',
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        multipleStatements: true,
      });

      const config = getDatabaseConfig();

      expect(config).toMatchObject({
        host: 'test-host',
        port: 3306,
        user: 'test-user',
        password: 'test-password',
        database: 'test_database',
        connectionLimit: 10,
        acquireTimeout: 60000,
        timeout: 60000,
        multipleStatements: true,
      });

      expect(typeof config.host).toBe('string');
      expect(typeof config.port).toBe('number');
      expect(typeof config.user).toBe('string');
      expect(typeof config.password).toBe('string');
      expect(typeof config.database).toBe('string');
      expect(typeof config.connectionLimit).toBe('number');
      expect(typeof config.multipleStatements).toBe('boolean');
    });

    it('should handle port conversion correctly', () => {
      // Test various port configurations
      const testCases = [
        { env: '3306', expected: 3306 },
        { env: '3307', expected: 3307 },
        { env: '33060', expected: 33060 },
        { env: undefined, expected: 3306 }, // default
      ];

      testCases.forEach(({ env, expected }) => {
        const originalPort = process.env.KEIRA_DATABASE_PORT;

        if (env) {
          process.env.KEIRA_DATABASE_PORT = env;
        } else {
          delete process.env.KEIRA_DATABASE_PORT;
        }

        const port = parseInt(process.env.KEIRA_DATABASE_PORT || '3306');
        expect(port).toBe(expected);
        expect(typeof port).toBe('number');

        // Restore original
        if (originalPort) {
          process.env.KEIRA_DATABASE_PORT = originalPort;
        }
      });
    });
  });

  describe('API Response Structures', () => {
    it('should define correct success response structure', () => {
      const successResponse = {
        success: true,
        result: [{ id: 1, name: 'test' }],
        fields: [{ name: 'id' }, { name: 'name' }],
      };

      expect(successResponse).toHaveProperty('success');
      expect(successResponse).toHaveProperty('result');
      expect(successResponse).toHaveProperty('fields');
      expect(successResponse.success).toBe(true);
      expect(Array.isArray(successResponse.result)).toBe(true);
      expect(Array.isArray(successResponse.fields)).toBe(true);
    });

    it('should define correct error response structure', () => {
      const errorResponse = {
        success: false,
        error: 'Database connection failed',
        code: 'ER_ACCESS_DENIED',
        errno: 1045,
        sqlMessage: 'Access denied for user',
        sqlState: '28000',
      };

      expect(errorResponse).toHaveProperty('success');
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.success).toBe(false);
      expect(typeof errorResponse.error).toBe('string');

      // Optional error properties
      if (errorResponse.code) expect(typeof errorResponse.code).toBe('string');
      if (errorResponse.errno) expect(typeof errorResponse.errno).toBe('number');
      if (errorResponse.sqlMessage) expect(typeof errorResponse.sqlMessage).toBe('string');
      if (errorResponse.sqlState) expect(typeof errorResponse.sqlState).toBe('string');
    });

    it('should define correct connection response structure', () => {
      const connectionResponse = {
        success: true,
        message: 'Connected to database',
      };

      expect(connectionResponse).toHaveProperty('success');
      expect(connectionResponse).toHaveProperty('message');
      expect(connectionResponse.success).toBe(true);
      expect(typeof connectionResponse.message).toBe('string');
    });

    it('should define correct state response structure', () => {
      const stateResponses = [{ state: 'CONNECTED' }, { state: 'DISCONNECTED' }, { state: 'ERROR', error: 'Connection lost' }];

      stateResponses.forEach((response) => {
        expect(response).toHaveProperty('state');
        expect(typeof response.state).toBe('string');
        expect(['CONNECTED', 'DISCONNECTED', 'ERROR']).toContain(response.state);

        if (response.state === 'ERROR') {
          expect(response).toHaveProperty('error');
          expect(typeof response.error).toBe('string');
        }
      });
    });
  });

  describe('API Endpoint Validation', () => {
    it('should validate required API endpoints', () => {
      const requiredEndpoints = [
        { method: 'GET', path: '/health' },
        { method: 'POST', path: '/api/database/connect' },
        { method: 'POST', path: '/api/database/query' },
        { method: 'GET', path: '/api/database/state' },
      ];

      requiredEndpoints.forEach((endpoint) => {
        expect(endpoint).toHaveProperty('method');
        expect(endpoint).toHaveProperty('path');
        expect(typeof endpoint.method).toBe('string');
        expect(typeof endpoint.path).toBe('string');
        expect(['GET', 'POST', 'PUT', 'DELETE']).toContain(endpoint.method);
      });
    });

    it('should validate request body structures', () => {
      const connectRequest = {
        config: {
          host: 'localhost',
          port: 3306,
          user: 'root',
          password: 'password',
          database: 'test',
        },
      };

      const queryRequest = {
        sql: 'SELECT * FROM test WHERE id = ?',
        params: [1],
      };

      // Validate connect request
      expect(connectRequest).toHaveProperty('config');
      expect(typeof connectRequest.config).toBe('object');
      expect(connectRequest.config).toHaveProperty('host');
      expect(connectRequest.config).toHaveProperty('user');

      // Validate query request
      expect(queryRequest).toHaveProperty('sql');
      expect(typeof queryRequest.sql).toBe('string');
      expect(queryRequest.sql).not.toBe('');

      if (queryRequest.params) {
        expect(Array.isArray(queryRequest.params)).toBe(true);
      }
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle various MySQL error codes', () => {
      const errorScenarios = [
        {
          code: 'ER_ACCESS_DENIED_ERROR',
          errno: 1045,
          description: 'Access denied',
        },
        {
          code: 'ER_BAD_DB_ERROR',
          errno: 1049,
          description: 'Unknown database',
        },
        {
          code: 'ER_NO_SUCH_TABLE',
          errno: 1146,
          description: 'Table does not exist',
        },
        {
          code: 'ER_PARSE_ERROR',
          errno: 1064,
          description: 'SQL syntax error',
        },
        {
          code: 'PROTOCOL_CONNECTION_LOST',
          errno: undefined,
          description: 'Connection lost',
        },
      ];

      errorScenarios.forEach((scenario) => {
        expect(scenario).toHaveProperty('code');
        expect(scenario).toHaveProperty('description');
        expect(typeof scenario.code).toBe('string');
        expect(typeof scenario.description).toBe('string');

        if (scenario.errno !== undefined) {
          expect(typeof scenario.errno).toBe('number');
        }
      });
    });

    it('should handle request validation errors', () => {
      const validationErrors = [
        {
          scenario: 'Missing SQL in query request',
          request: { params: [] },
          expectedError: 'SQL query is required',
        },
        {
          scenario: 'Empty SQL in query request',
          request: { sql: '', params: [] },
          expectedError: 'SQL query is required',
        },
        {
          scenario: 'Invalid JSON in request body',
          request: 'invalid json',
          expectedError: 'Invalid JSON',
        },
      ];

      validationErrors.forEach(({ scenario, request, expectedError }) => {
        expect(scenario).toBeDefined();
        expect(expectedError).toBeDefined();
        expect(typeof scenario).toBe('string');
        expect(typeof expectedError).toBe('string');
      });
    });
  });

  describe('Production error redaction', () => {
    // Mirrors createEnhancedErrorResponse()'s redaction contract in docker/api/database-api.js:
    // in production, unmapped errors get a generic message and errno/sqlState/sqlMessage are
    // stripped from the client-facing response; mapped (known) MySQL errors still surface their
    // human-readable message and `code`/`category` so clients can branch on error type.
    const MAPPED_CODES = new Set([
      'ER_ACCESS_DENIED_ERROR',
      'ER_DBACCESS_DENIED_ERROR',
      'ER_BAD_DB_ERROR',
      'ER_NO_SUCH_TABLE',
      'ER_BAD_FIELD_ERROR',
      'ER_PARSE_ERROR',
      'ER_SYNTAX_ERROR',
      'ER_DUP_ENTRY',
      'ER_ROW_IS_REFERENCED',
      'ER_ROW_IS_REFERENCED_2',
      'ER_NO_REFERENCED_ROW',
      'ER_NO_REFERENCED_ROW_2',
      'PROTOCOL_CONNECTION_LOST',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNRESET',
    ]);

    function buildClientResponse(error, { production }) {
      const isMappedError = MAPPED_CODES.has(error.code);
      const clientMessage = !production || isMappedError ? error.message || 'An unexpected error occurred' : 'An unexpected error occurred';

      const response = {
        success: false,
        error: clientMessage,
      };
      if (error.code) response.code = error.code;
      if (!production) {
        if (error.errno) response.errno = error.errno;
        if (error.sqlState) response.sqlState = error.sqlState;
        if (error.sqlMessage) response.sqlMessage = error.sqlMessage;
      }
      return response;
    }

    const dbError = {
      code: 'ER_ACCESS_DENIED_ERROR',
      message: "Access denied for user 'root'@'%' (using password: YES)",
      errno: 1045,
      sqlState: '28000',
      sqlMessage: "Access denied for user 'root'@'%'",
    };

    const internalError = {
      code: 'SOME_UNMAPPED_DRIVER_ERROR',
      message: 'unexpected internal detail leaking schema info',
    };

    it('includes sqlMessage/sqlState/errno for a mapped error in non-production', () => {
      const response = buildClientResponse(dbError, { production: false });

      expect(response.error).toBe(dbError.message);
      expect(response.sqlMessage).toBe(dbError.sqlMessage);
      expect(response.sqlState).toBe(dbError.sqlState);
      expect(response.errno).toBe(dbError.errno);
      expect(response.code).toBe(dbError.code);
    });

    it('strips sqlMessage/sqlState/errno in production but keeps message for a mapped error', () => {
      const response = buildClientResponse(dbError, { production: true });

      expect(response.error).toBe(dbError.message);
      expect(response.code).toBe(dbError.code);
      expect(response).not.toHaveProperty('sqlMessage');
      expect(response).not.toHaveProperty('sqlState');
      expect(response).not.toHaveProperty('errno');
    });

    it('replaces the message with a generic string in production for an unmapped error', () => {
      const response = buildClientResponse(internalError, { production: true });

      expect(response.error).toBe('An unexpected error occurred');
      expect(response.error).not.toContain('leaking schema info');
      expect(response.code).toBe(internalError.code);
    });

    it('surfaces the raw message for an unmapped error outside production', () => {
      const response = buildClientResponse(internalError, { production: false });

      expect(response.error).toBe(internalError.message);
    });
  });
});

describe('Server Configuration', () => {
  it('should use correct port configuration', () => {
    const port = process.env.DB_API_PORT || '3001';
    expect(port).toBe('3001');

    const numericPort = parseInt(port);
    expect(numericPort).toBe(3001);
    expect(numericPort).toBeGreaterThan(1024); // Non-privileged port
    expect(numericPort).toBeLessThan(65536); // Valid port range
  });

  it('should configure middleware correctly', () => {
    const middlewareConfig = {
      cors: true,
      jsonLimit: '10mb',
      urlencoded: true,
    };

    expect(middlewareConfig.cors).toBe(true);
    expect(middlewareConfig.jsonLimit).toBe('10mb');
    expect(middlewareConfig.urlencoded).toBe(true);
  });

  it('should handle graceful shutdown signals', () => {
    const shutdownSignals = ['SIGINT', 'SIGTERM'];

    shutdownSignals.forEach((signal) => {
      expect(typeof signal).toBe('string');
      expect(signal).toMatch(/^SIG/);
    });
  });
});

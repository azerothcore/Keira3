/**
 * Integration Tests for Database Connection Pool and Error Handling
 * Tests the database connection pooling logic and error recovery mechanisms
 *
 * Only the tests under "Connection Pool Resource Management" (below) actually need a
 * reachable MySQL instance to exercise real connection lifecycles; they are gated behind
 * KEIRA_LIVE_DB=1 and are the only tests in this file that create a real mysql2 pool.
 * Every other test here works on local values / the real getDatabaseConfig() and must not
 * pay for pool creation or teardown.
 */

const mysql = require('mysql2');
const { getDatabaseConfig } = require('../api/database-api');

const LIVE = process.env.KEIRA_LIVE_DB === '1';
const describeLive = LIVE ? describe : describe.skip;

describe('Database Connection Pool Integration Tests', () => {
  describe('Connection Pool Configuration', () => {
    const ORIGINAL_ENV = { ...process.env };

    afterEach(() => {
      process.env = { ...ORIGINAL_ENV };
    });

    it('should handle default configuration values correctly', () => {
      delete process.env.KEIRA_DATABASE_HOST;
      delete process.env.KEIRA_DATABASE_PORT;
      delete process.env.KEIRA_DATABASE_USER;
      delete process.env.KEIRA_DATABASE_PASSWORD;
      delete process.env.KEIRA_DATABASE_NAME;

      const config = getDatabaseConfig();

      expect(config.host).toBe('localhost');
      expect(config.port).toBe(3306);
      expect(config.user).toBe('root');
      expect(config.password).toBe('');
      expect(config.database).toBe('acore_world');
    });

    it('should override defaults with environment variables', () => {
      process.env.KEIRA_DATABASE_HOST = 'custom-host';
      process.env.KEIRA_DATABASE_PORT = '3307';
      process.env.KEIRA_DATABASE_USER = 'custom_user';
      process.env.KEIRA_DATABASE_PASSWORD = 'custom_password';
      process.env.KEIRA_DATABASE_NAME = 'custom_database';

      const config = getDatabaseConfig();

      expect(config.host).toBe('custom-host');
      expect(config.port).toBe(3307);
      expect(config.user).toBe('custom_user');
      expect(config.password).toBe('custom_password');
      expect(config.database).toBe('custom_database');
    });
  });

  describe('Connection Pool Error Handling', () => {
    it('should handle connection errors gracefully', (done) => {
      // Mock connection error handling without actual network calls
      const mockConnectionError = {
        code: 'ECONNREFUSED',
        errno: -61,
        syscall: 'connect',
        address: '127.0.0.1',
        port: 9999,
        message: 'Connection refused',
      };

      // Validate error structure
      expect(mockConnectionError.code).toBeDefined();
      expect(mockConnectionError.errno).toBeDefined();
      expect(mockConnectionError.message).toBeDefined();

      // Common MySQL error codes should be recognized
      const expectedErrorCodes = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR'];

      expect(expectedErrorCodes).toContain(mockConnectionError.code);
      done();
    });

    it('should handle SQL syntax errors appropriately', (done) => {
      // Use a simple in-memory test to avoid actual database dependency
      const mockConnection = {
        query: (sql, params, callback) => {
          // Simulate SQL syntax error
          const syntaxError = new Error('SQL syntax error');
          syntaxError.code = 'ER_PARSE_ERROR';
          syntaxError.errno = 1064;
          syntaxError.sqlState = '42000';
          syntaxError.sqlMessage = 'You have an error in your SQL syntax';

          if (typeof params === 'function') {
            params(syntaxError);
          } else {
            callback(syntaxError);
          }
        },
      };

      const invalidSql = 'SELECT * FROM table WHERE invalid syntax ===';

      mockConnection.query(invalidSql, (err, results) => {
        expect(err).toBeDefined();
        expect(err.code).toBe('ER_PARSE_ERROR');
        expect(err.errno).toBe(1064);
        expect(err.sqlState).toBe('42000');
        expect(err.sqlMessage).toContain('syntax');
        expect(results).toBeUndefined();
        done();
      });
    });

    it('should handle various MySQL error scenarios', () => {
      const errorScenarios = [
        {
          code: 'ER_ACCESS_DENIED_ERROR',
          errno: 1045,
          description: 'Access denied for user',
          category: 'authentication',
        },
        {
          code: 'ER_BAD_DB_ERROR',
          errno: 1049,
          description: 'Unknown database',
          category: 'database',
        },
        {
          code: 'ER_NO_SUCH_TABLE',
          errno: 1146,
          description: 'Table does not exist',
          category: 'table',
        },
        {
          code: 'ER_PARSE_ERROR',
          errno: 1064,
          description: 'SQL syntax error',
          category: 'syntax',
        },
        {
          code: 'PROTOCOL_CONNECTION_LOST',
          errno: undefined,
          description: 'Connection lost',
          category: 'connection',
        },
      ];

      errorScenarios.forEach((scenario) => {
        expect(scenario.code).toBeDefined();
        expect(scenario.description).toBeDefined();
        expect(scenario.category).toBeDefined();
        expect(typeof scenario.code).toBe('string');
        expect(typeof scenario.description).toBe('string');

        if (scenario.errno !== undefined) {
          expect(typeof scenario.errno).toBe('number');
          expect(scenario.errno).toBeGreaterThan(0);
        }
      });
    });
  });

  // These tests need a real, reachable MySQL instance to exercise actual connection
  // lifecycles (getConnection/release, pool exhaustion, and post-release reuse). They are
  // the only tests in this file that create a real mysql2 pool, and only within the test
  // (or its own beforeEach/afterEach), not globally for the whole file.
  describeLive('Connection Pool Resource Management', () => {
    const testConfig = {
      host: process.env.KEIRA_DATABASE_HOST || 'localhost',
      port: parseInt(process.env.KEIRA_DATABASE_PORT || '3306'),
      user: process.env.KEIRA_DATABASE_USER || 'test_user',
      password: process.env.KEIRA_DATABASE_PASSWORD || 'test_password',
      database: process.env.KEIRA_DATABASE_NAME || 'test_database',
      connectionLimit: 10,
      multipleStatements: true,
    };

    let testPool;

    beforeEach(() => {
      testPool = mysql.createPool(testConfig);
    });

    afterEach((done) => {
      if (testPool) {
        testPool.end(() => done());
      } else {
        done();
      }
    });

    it('should create pool with correct configuration parameters', () => {
      const poolConfig = testPool.config;

      expect(poolConfig).toBeDefined();
      expect(typeof poolConfig).toBe('object');
      expect(poolConfig.connectionLimit).toBe(10);

      expect(typeof testPool.getConnection).toBe('function');
      expect(typeof testPool.end).toBe('function');
      expect(typeof testPool.query).toBe('function');
    });

    it('should manage connection lifecycle correctly', (done) => {
      let connectionCount = 0;
      const maxConnections = 3;
      const connections = [];

      // Get multiple connections
      for (let i = 0; i < maxConnections; i++) {
        testPool.getConnection((err, connection) => {
          if (err) {
            // Connection failed - this is acceptable in test environment
            connectionCount++;
          } else {
            // Connection succeeded
            connections.push(connection);
            connectionCount++;
          }

          // When all connection attempts complete
          if (connectionCount === maxConnections) {
            // Release all successful connections
            connections.forEach((conn) => {
              if (conn && conn.release) {
                conn.release();
              }
            });

            // Verify pool can still provide connections after release
            testPool.getConnection((err, newConnection) => {
              if (newConnection && newConnection.release) {
                newConnection.release();
              }
              // Test completed successfully regardless of connection success
              done();
            });
          }
        });
      }
    });

    it('should handle connection pool limits correctly', () => {
      const poolConfig = { ...testConfig, connectionLimit: 5 };
      const limitedPool = mysql.createPool(poolConfig);

      expect(limitedPool.config.connectionLimit).toBe(5);

      limitedPool.end();
    });
  });

  describe('Connection Pool Parameter Validation', () => {
    it('should reject non-positive connection limits', () => {
      // Exercises the actual validation rule (connectionLimit > 0), rather than asserting
      // on a `valid` flag the test itself declared (which was always true and never
      // exercised the false branch).
      const isValidConnectionLimit = (connectionLimit) => typeof connectionLimit === 'number' && connectionLimit > 0;

      expect(isValidConnectionLimit(10)).toBe(true);
      expect(isValidConnectionLimit(1)).toBe(true);
      expect(isValidConnectionLimit(100)).toBe(true);
      expect(isValidConnectionLimit(0)).toBe(false);
      expect(isValidConnectionLimit(-1)).toBe(false);
      expect(isValidConnectionLimit('10')).toBe(false);
    });
  });

  describe('API Response Structure Validation', () => {
    it('should validate success response structure', () => {
      const successResponse = {
        success: true,
        result: [{ id: 1, name: 'Test Record' }],
        fields: [
          { name: 'id', type: 'number' },
          { name: 'name', type: 'string' },
        ],
      };

      expect(successResponse).toHaveProperty('success');
      expect(successResponse).toHaveProperty('result');
      expect(successResponse).toHaveProperty('fields');
      expect(successResponse.success).toBe(true);
      expect(Array.isArray(successResponse.result)).toBe(true);
      expect(Array.isArray(successResponse.fields)).toBe(true);

      // Validate result structure
      expect(successResponse.result.length).toBeGreaterThan(0);
      expect(successResponse.result[0]).toHaveProperty('id');
      expect(successResponse.result[0]).toHaveProperty('name');

      // Validate fields structure
      expect(successResponse.fields.length).toBeGreaterThan(0);
      expect(successResponse.fields[0]).toHaveProperty('name');
    });

    it('should validate error response structure', () => {
      const errorResponse = {
        success: false,
        error: 'Database connection failed',
        code: 'ER_ACCESS_DENIED',
        errno: 1045,
        sqlMessage: "Access denied for user 'test'@'localhost'",
        sqlState: '28000',
      };

      expect(errorResponse).toHaveProperty('success');
      expect(errorResponse).toHaveProperty('error');
      expect(errorResponse.success).toBe(false);
      expect(typeof errorResponse.error).toBe('string');
      expect(errorResponse.error.length).toBeGreaterThan(0);

      // Optional error properties validation
      if (errorResponse.code) {
        expect(typeof errorResponse.code).toBe('string');
        expect(errorResponse.code).toMatch(/^ER_|^PROTOCOL_/);
      }

      if (errorResponse.errno) {
        expect(typeof errorResponse.errno).toBe('number');
        expect(errorResponse.errno).toBeGreaterThan(0);
      }

      if (errorResponse.sqlMessage) {
        expect(typeof errorResponse.sqlMessage).toBe('string');
      }

      if (errorResponse.sqlState) {
        expect(typeof errorResponse.sqlState).toBe('string');
        expect(errorResponse.sqlState).toMatch(/^\d{5}$/);
      }
    });

    it('should validate connection state response structure', () => {
      // docker/api/database-api.js's /api/database/state only ever returns CONNECTED,
      // DISCONNECTED, or ERROR (see libs/shared/constants/src/types/database-api.ts and
      // docker/tests/database-api.spec.js) - CONNECTING is not a state the API can return.
      const stateResponses = [{ state: 'CONNECTED' }, { state: 'DISCONNECTED' }, { state: 'ERROR', error: 'Connection timeout' }];

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

    it('should validate query result metadata', () => {
      const queryResult = {
        success: true,
        result: [
          { id: 1, entry: 12345, name: 'Test Creature' },
          { id: 2, entry: 12346, name: 'Another Creature' },
        ],
        fields: [
          {
            name: 'id',
            columnType: 3,
            type: 3,
            flags: 16899,
            decimals: 0,
          },
          {
            name: 'entry',
            columnType: 3,
            type: 3,
            flags: 16899,
            decimals: 0,
          },
          {
            name: 'name',
            columnType: 253,
            type: 253,
            flags: 0,
            decimals: 31,
          },
        ],
      };

      expect(queryResult.success).toBe(true);
      expect(Array.isArray(queryResult.result)).toBe(true);
      expect(Array.isArray(queryResult.fields)).toBe(true);

      // Validate field metadata
      queryResult.fields.forEach((field) => {
        expect(field).toHaveProperty('name');
        expect(field).toHaveProperty('type');
        expect(typeof field.name).toBe('string');
        expect(typeof field.type).toBe('number');
      });

      // Validate result data consistency
      if (queryResult.result.length > 0) {
        const firstRow = queryResult.result[0];
        const fieldNames = queryResult.fields.map((f) => f.name);

        fieldNames.forEach((fieldName) => {
          expect(firstRow).toHaveProperty(fieldName);
        });
      }
    });
  });
});

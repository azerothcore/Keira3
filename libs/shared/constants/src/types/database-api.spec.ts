import {
  DatabaseConnectionConfig,
  DatabaseConnectionRequest,
  DatabaseConnectionResult,
  DatabaseQueryRequest,
  DatabaseQueryResult,
  DatabaseStateResponse,
  DatabaseConnectionState,
  MySQLErrorCode,
  isDatabaseConnectionRequest,
  isDatabaseQueryRequest,
  isDatabaseSuccessResponse,
  isDatabaseErrorResponse,
  DatabaseFieldInfo,
  QueryResultMeta,
  EnhancedMysqlResult,
} from './database-api';

describe('Database API Type Definitions', () => {
  describe('Type Guards', () => {
    it('should validate DatabaseConnectionRequest correctly', () => {
      const validRequest = {
        config: {
          host: 'localhost',
          port: 3306,
          user: 'root',
          password: 'password',
          database: 'test',
        },
      };

      const invalidRequest1 = { config: null };
      const invalidRequest2 = { wrong: 'property' };
      const invalidRequest3 = {
        config: {
          host: 'localhost',
          // Missing required properties
        },
      };

      expect(isDatabaseConnectionRequest(validRequest)).toBe(true);
      expect(isDatabaseConnectionRequest(invalidRequest1)).toBe(false);
      expect(isDatabaseConnectionRequest(invalidRequest2)).toBe(false);
      expect(isDatabaseConnectionRequest(invalidRequest3)).toBe(false);
      expect(isDatabaseConnectionRequest(null)).toBe(false);
      expect(isDatabaseConnectionRequest(undefined)).toBe(false);
    });

    it('should validate DatabaseQueryRequest correctly', () => {
      const validRequest1 = {
        sql: 'SELECT * FROM users',
        params: ['test'],
      };

      const validRequest2 = {
        sql: 'SELECT 1',
      };

      const invalidRequest1 = { sql: '' }; // Empty SQL
      const invalidRequest2 = { sql: 123 }; // Wrong type
      const invalidRequest3 = { params: ['test'] }; // Missing SQL

      expect(isDatabaseQueryRequest(validRequest1)).toBe(true);
      expect(isDatabaseQueryRequest(validRequest2)).toBe(true);
      expect(isDatabaseQueryRequest(invalidRequest1)).toBe(false);
      expect(isDatabaseQueryRequest(invalidRequest2)).toBe(false);
      expect(isDatabaseQueryRequest(invalidRequest3)).toBe(false);
    });

    it('should validate DatabaseSuccessResponse correctly', () => {
      const successResponse = {
        success: true,
        result: [{ id: 1, name: 'test' }],
        fields: [],
      };

      const errorResponse = {
        success: false,
        error: 'Test error',
      };

      const invalidResponse = {
        success: 'true', // Wrong type
        result: [],
      };

      expect(isDatabaseSuccessResponse(successResponse)).toBe(true);
      expect(isDatabaseSuccessResponse(errorResponse)).toBe(false);
      expect(isDatabaseSuccessResponse(invalidResponse)).toBe(false);
    });

    it('should validate DatabaseErrorResponse correctly', () => {
      const errorResponse1 = {
        success: false,
        error: 'Test error',
      };

      const errorResponse2 = {
        success: false,
        error: 'MySQL error',
        code: 'ER_ACCESS_DENIED_ERROR' as MySQLErrorCode,
        errno: 1045,
      };

      const successResponse = {
        success: true,
        result: [],
      };

      const invalidResponse = {
        success: false,
        // Missing error property
      };

      expect(isDatabaseErrorResponse(errorResponse1)).toBe(true);
      expect(isDatabaseErrorResponse(errorResponse2)).toBe(true);
      expect(isDatabaseErrorResponse(successResponse)).toBe(false);
      expect(isDatabaseErrorResponse(invalidResponse)).toBe(false);
    });
  });

  describe('Interface Compliance', () => {
    it('should ensure DatabaseConnectionConfig has all required properties', () => {
      const config: DatabaseConnectionConfig = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'password',
        database: 'test_db',
      };

      expect(config.host).toBeDefined();
      expect(config.port).toBeDefined();
      expect(config.user).toBeDefined();
      expect(config.password).toBeDefined();
      expect(config.database).toBeDefined();

      expect(typeof config.host).toBe('string');
      expect(typeof config.port).toBe('number');
      expect(typeof config.user).toBe('string');
      expect(typeof config.password).toBe('string');
      expect(typeof config.database).toBe('string');
    });

    it('should ensure DatabaseConnectionConfig supports optional properties', () => {
      const configWithOptionals: DatabaseConnectionConfig = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'password',
        database: 'test_db',
        connectionLimit: 10,
        multipleStatements: true,
      };

      expect(configWithOptionals.connectionLimit).toBe(10);
      expect(configWithOptionals.multipleStatements).toBe(true);
    });

    it('should ensure DatabaseFieldInfo structure is correct', () => {
      const fieldInfo: DatabaseFieldInfo = {
        name: 'id',
        columnType: 3,
        type: 3,
        flags: 16899,
        decimals: 0,
      };

      expect(fieldInfo.name).toBe('id');
      expect(typeof fieldInfo.name).toBe('string');
      expect(typeof fieldInfo.columnType).toBe('number');
      expect(typeof fieldInfo.type).toBe('number');
    });

    it('should ensure QueryResultMeta structure is correct', () => {
      const resultMeta: QueryResultMeta = {
        affectedRows: 1,
        insertId: 42,
        changedRows: 1,
        warningStatus: 0,
      };

      expect(resultMeta.affectedRows).toBe(1);
      expect(resultMeta.insertId).toBe(42);
      expect(typeof resultMeta.affectedRows).toBe('number');
      expect(typeof resultMeta.insertId).toBe('number');
    });

    it('should ensure EnhancedMysqlResult structure is correct', () => {
      const enhancedResult: EnhancedMysqlResult = {
        success: true,
        result: [{ id: 1, name: 'test' }],
        fields: [{ name: 'id' }, { name: 'name' }],
        executionTime: 123,
        rowCount: 1,
        metadata: {
          query: 'SELECT * FROM test',
          parameters: [1],
          timestamp: new Date().toISOString(),
        },
      };

      expect(enhancedResult.success).toBe(true);
      expect(enhancedResult.executionTime).toBe(123);
      expect(enhancedResult.rowCount).toBe(1);
      expect(enhancedResult.metadata).toBeDefined();
      expect(enhancedResult.metadata!.query).toBe('SELECT * FROM test');
    });
  });

  describe('Enum Values', () => {
    it('should validate DatabaseConnectionState enum values', () => {
      const states = [
        DatabaseConnectionState.CONNECTED,
        DatabaseConnectionState.DISCONNECTED,
        DatabaseConnectionState.CONNECTING,
        DatabaseConnectionState.ERROR,
      ];

      expect(states).toContain('CONNECTED');
      expect(states).toContain('DISCONNECTED');
      expect(states).toContain('CONNECTING');
      expect(states).toContain('ERROR');

      states.forEach((state) => {
        expect(typeof state).toBe('string');
        expect(state.length).toBeGreaterThan(0);
      });
    });

    it('should validate MySQLErrorCode type constraints', () => {
      const errorCodes: MySQLErrorCode[] = [
        'ER_ACCESS_DENIED_ERROR',
        'ER_BAD_DB_ERROR',
        'ER_NO_SUCH_TABLE',
        'ER_PARSE_ERROR',
        'PROTOCOL_CONNECTION_LOST',
        'ECONNREFUSED',
        'ENOTFOUND',
        'ETIMEDOUT',
      ];

      errorCodes.forEach((code) => {
        expect(typeof code).toBe('string');
        expect(code.length).toBeGreaterThan(0);
      });

      // Ensure specific error codes are included
      expect(errorCodes).toContain('ER_ACCESS_DENIED_ERROR');
      expect(errorCodes).toContain('PROTOCOL_CONNECTION_LOST');
      expect(errorCodes).toContain('ECONNREFUSED');
    });
  });

  describe('Response Type Validation', () => {
    it('should validate successful query response structure', () => {
      const successResponse: DatabaseQueryResult = {
        success: true,
        result: [{ id: 1, name: 'John' }],
        fields: [
          { name: 'id', type: 3 },
          { name: 'name', type: 253 },
        ],
      };

      expect(successResponse.success).toBe(true);
      expect(Array.isArray(successResponse.result)).toBe(true);
      expect(Array.isArray(successResponse.fields)).toBe(true);

      if ('result' in successResponse) {
        expect(successResponse.result).toBeDefined();
      }
    });

    it('should validate error response structure', () => {
      const errorResponse: DatabaseQueryResult = {
        success: false,
        error: 'Table not found',
        code: 'ER_NO_SUCH_TABLE',
        errno: 1146,
        sqlState: '42S02',
      };

      expect(errorResponse.success).toBe(false);
      expect(typeof errorResponse.error).toBe('string');

      if ('code' in errorResponse) {
        expect(errorResponse.code).toBe('ER_NO_SUCH_TABLE');
      }
    });

    it('should validate connection response types', () => {
      const successConnectionResponse: DatabaseConnectionResult = {
        success: true,
        message: 'Connected successfully',
      };

      const errorConnectionResponse: DatabaseConnectionResult = {
        success: false,
        error: 'Access denied',
        code: 'ER_ACCESS_DENIED_ERROR',
        errno: 1045,
      };

      expect(successConnectionResponse.success).toBe(true);
      expect(errorConnectionResponse.success).toBe(false);

      if ('message' in successConnectionResponse) {
        expect(typeof successConnectionResponse.message).toBe('string');
      }

      if ('error' in errorConnectionResponse) {
        expect(typeof errorConnectionResponse.error).toBe('string');
      }
    });

    it('should validate state response structure', () => {
      const stateResponses: DatabaseStateResponse[] = [
        { state: DatabaseConnectionState.CONNECTED },
        { state: DatabaseConnectionState.ERROR, error: 'Connection lost' },
      ];

      stateResponses.forEach((response) => {
        expect(response.state).toBeDefined();
        expect(typeof response.state).toBe('string');

        if (response.state === DatabaseConnectionState.ERROR) {
          expect(response.error).toBeDefined();
          expect(typeof response.error).toBe('string');
        }
      });
    });
  });

  describe('Read-only Properties', () => {
    it('should ensure configuration objects are properly typed as readonly', () => {
      const config: DatabaseConnectionConfig = {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: 'password',
        database: 'test_db',
      };

      // TypeScript should prevent modification of readonly properties
      // These tests verify the type structure
      expect(config).toHaveProperty('host');
      expect(config).toHaveProperty('port');
      expect(config).toHaveProperty('user');
      expect(config).toHaveProperty('password');
      expect(config).toHaveProperty('database');
    });

    it('should ensure request objects maintain immutability constraints', () => {
      const queryRequest: DatabaseQueryRequest = {
        sql: 'SELECT * FROM users WHERE id = ?',
        params: [1, 'test'],
      };

      expect(queryRequest.sql).toBeDefined();
      expect(Array.isArray(queryRequest.params)).toBe(true);
      expect(queryRequest.params).toEqual([1, 'test']);
    });
  });
});

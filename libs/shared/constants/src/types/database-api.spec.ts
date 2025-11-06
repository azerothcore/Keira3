import {
  DatabaseConnectionError,
  DatabaseConnectionResult,
  DatabaseQueryError,
  DatabaseQueryResponse,
  DatabaseQueryResult,
  isDatabaseErrorResponse,
  isDatabaseSuccessResponse,
} from './database-api';

describe('database API type guards', () => {
  it('should identify success responses', () => {
    const success: DatabaseQueryResponse = { success: true, result: [] };
    expect(isDatabaseSuccessResponse(success)).toBe(true);

    const connectionSuccess: DatabaseConnectionResult = { success: true, message: 'ok' };
    expect(isDatabaseSuccessResponse(connectionSuccess)).toBe(true);
  });

  it('should identify error responses', () => {
    const queryError: DatabaseQueryError = { success: false, error: 'boom' };
    expect(isDatabaseErrorResponse(queryError)).toBe(true);

    const connectionError: DatabaseConnectionError = { success: false, error: 'nope' };
    expect(isDatabaseErrorResponse(connectionError)).toBe(true);
  });

  it('should reject mismatched responses', () => {
    const invalid = { result: [] } as unknown as DatabaseQueryResult;
    expect(isDatabaseSuccessResponse(invalid)).toBe(false);
    expect(isDatabaseErrorResponse(invalid)).toBe(false);
  });
});

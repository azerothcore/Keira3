/**
 * Shared types for the HTTP database API used by the web build.
 * These types mirror the payloads exchanged between the Angular app
 * and the Node.js bridge exposed in Docker deployments.
 */
export interface DatabaseConnectionRequest {
  readonly config: Record<string, unknown>;
}

export interface DatabaseConnectionResponse {
  readonly success: true;
  readonly message?: string;
}

export interface DatabaseConnectionError {
  readonly success: false;
  readonly error: string;
  readonly category?: string;
  readonly code?: string;
}

export type DatabaseConnectionResult = DatabaseConnectionResponse | DatabaseConnectionError;

export interface DatabaseQueryRequest {
  readonly sql: string;
  readonly params?: ReadonlyArray<string | number | null>;
}

export interface DatabaseQueryResponse<T = unknown> {
  readonly success: true;
  readonly result: ReadonlyArray<T>;
  readonly fields?: ReadonlyArray<unknown>;
}

export interface DatabaseQueryError {
  readonly success: false;
  readonly error: string;
  readonly category?: string;
  readonly code?: string;
}

export type DatabaseQueryResult<T = unknown> = DatabaseQueryResponse<T> | DatabaseQueryError;

export const enum DatabaseConnectionState {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  ERROR = 'ERROR',
}

export interface DatabaseStateResponse {
  readonly state: DatabaseConnectionState;
  readonly error?: string;
}

export function isDatabaseSuccessResponse<T>(
  response: DatabaseQueryResult<T> | DatabaseConnectionResult,
): response is DatabaseQueryResponse<T> | DatabaseConnectionResponse {
  return Boolean(response && typeof response === 'object' && (response as DatabaseQueryResponse<T>).success === true);
}

export function isDatabaseErrorResponse(
  response: DatabaseQueryResult<unknown> | DatabaseConnectionResult,
): response is DatabaseQueryError | DatabaseConnectionError {
  return Boolean(response && typeof response === 'object' && (response as DatabaseQueryError).success === false);
}

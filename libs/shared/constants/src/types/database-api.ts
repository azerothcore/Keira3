import { FieldPacket } from 'mysql2';

/**
 * Strict TypeScript type definitions for Database API interfaces
 * Ensures type safety for HTTP API communication between Angular and Node.js
 */

// =============================================================================
// Database Connection Types
// =============================================================================

export interface DatabaseConnectionConfig {
  readonly host?: string;
  readonly port?: number;
  readonly user?: string;
  readonly password?: string;
  readonly database?: string;
  readonly connectionLimit?: number;
  readonly multipleStatements?: boolean;
}

export interface DatabaseConnectionRequest {
  readonly config: DatabaseConnectionConfig;
}

export interface DatabaseConnectionResponse {
  readonly success: true;
  readonly message: string;
}

export interface DatabaseConnectionError {
  readonly success: false;
  readonly error: string;
  readonly code?: MySQLErrorCode;
  readonly errno?: number;
  readonly sqlState?: string;
  readonly sqlMessage?: string;
}

export type DatabaseConnectionResult = DatabaseConnectionResponse | DatabaseConnectionError;

// =============================================================================
// Database Query Types
// =============================================================================

export interface DatabaseQueryRequest {
  readonly sql: string;
  readonly params?: ReadonlyArray<string | number | null>;
}

export interface DatabaseQueryResponse<T = unknown> {
  readonly success: true;
  readonly result: T[] | QueryResultMeta;
  readonly fields: ReadonlyArray<DatabaseFieldInfo>;
}

export interface DatabaseQueryError {
  readonly success: false;
  readonly error: string;
  readonly code?: MySQLErrorCode;
  readonly errno?: number;
  readonly sqlState?: string;
  readonly sqlMessage?: string;
}

export type DatabaseQueryResult<T = unknown> = DatabaseQueryResponse<T> | DatabaseQueryError;

// =============================================================================
// Database Field and Result Types
// =============================================================================

export interface DatabaseFieldInfo {
  readonly name: string;
  readonly columnType?: number;
  readonly type?: number;
  readonly flags?: number;
  readonly decimals?: number;
  readonly encoding?: string;
  readonly characterSet?: number;
}

export interface QueryResultMeta {
  readonly affectedRows?: number;
  readonly insertId?: number;
  readonly changedRows?: number;
  readonly warningStatus?: number;
}

// =============================================================================
// Database State Types
// =============================================================================

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

// =============================================================================
// MySQL Error Code Types
// =============================================================================

export type MySQLErrorCode =
  | 'ER_ACCESS_DENIED_ERROR'
  | 'ER_BAD_DB_ERROR'
  | 'ER_NO_SUCH_TABLE'
  | 'ER_PARSE_ERROR'
  | 'ER_DUP_ENTRY'
  | 'ER_NO_REFERENCED_ROW'
  | 'ER_ROW_IS_REFERENCED'
  | 'ER_CANNOT_ADD_FOREIGN'
  | 'ER_CANNOT_CREATE_TABLE'
  | 'ER_CANNOT_DROP_FOREIGN_KEY'
  | 'PROTOCOL_CONNECTION_LOST'
  | 'PROTOCOL_PACKETS_OUT_OF_ORDER'
  | 'ECONNREFUSED'
  | 'ENOTFOUND'
  | 'ETIMEDOUT'
  | 'ECONNRESET';

export interface MySQLErrorInfo {
  readonly code: MySQLErrorCode;
  readonly errno?: number;
  readonly sqlState?: string;
  readonly sqlMessage?: string;
  readonly description: string;
  readonly category: 'authentication' | 'database' | 'table' | 'syntax' | 'connection' | 'constraint' | 'network';
}

// =============================================================================
// API Endpoint Types
// =============================================================================

export const enum DatabaseApiEndpoint {
  CONNECT = '/api/database/connect',
  QUERY = '/api/database/query',
  STATE = '/api/database/state',
  HEALTH = '/health',
}

export interface ApiEndpointDefinition {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly path: string;
  readonly description: string;
}

export const API_ENDPOINTS: Record<string, ApiEndpointDefinition> = {
  connect: {
    method: 'POST',
    path: DatabaseApiEndpoint.CONNECT,
    description: 'Establish database connection',
  },
  query: {
    method: 'POST',
    path: DatabaseApiEndpoint.QUERY,
    description: 'Execute SQL query',
  },
  state: {
    method: 'GET',
    path: DatabaseApiEndpoint.STATE,
    description: 'Get connection state',
  },
  health: {
    method: 'GET',
    path: DatabaseApiEndpoint.HEALTH,
    description: 'Health check endpoint',
  },
} as const;

// =============================================================================
// HTTP Response Types
// =============================================================================

export interface HttpSuccessResponse<T = unknown> {
  readonly success: true;
  readonly data?: T;
  readonly message?: string;
}

export interface HttpErrorResponse {
  readonly success: false;
  readonly error: string;
  readonly statusCode?: number;
  readonly timestamp?: string;
}

export type HttpApiResponse<T = unknown> = HttpSuccessResponse<T> | HttpErrorResponse;

// =============================================================================
// Configuration Types
// =============================================================================

export interface DatabaseApiConfiguration {
  readonly host: string;
  readonly port: number;
  readonly corsEnabled: boolean;
  readonly jsonLimit: string;
  readonly urlEncodedExtended: boolean;
  readonly environment: 'development' | 'production' | 'test';
}

export interface ServerConfiguration {
  readonly port: number;
  readonly host: string;
  readonly middleware: {
    readonly cors: boolean;
    readonly jsonLimit: string;
    readonly urlencoded: boolean;
  };
  readonly gracefulShutdown: {
    readonly signals: ReadonlyArray<NodeJS.Signals>;
    readonly timeout: number;
  };
}

// =============================================================================
// Validation and Guard Types
// =============================================================================

export interface RequestValidationError {
  readonly field: string;
  readonly message: string;
  readonly received?: unknown;
  readonly expected?: string;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ReadonlyArray<RequestValidationError>;
}

// Type guards for runtime type checking
export function isDatabaseConnectionRequest(obj: unknown): obj is DatabaseConnectionRequest {
  return typeof obj === 'object' && obj !== null && 'config' in obj && typeof (obj as any).config === 'object';
}

export function isDatabaseQueryRequest(obj: unknown): obj is DatabaseQueryRequest {
  return typeof obj === 'object' && obj !== null && 'sql' in obj && typeof (obj as any).sql === 'string';
}

export function isDatabaseSuccessResponse<T>(obj: unknown): obj is DatabaseQueryResponse<T> {
  return typeof obj === 'object' && obj !== null && 'success' in obj && (obj as any).success === true;
}

export function isDatabaseErrorResponse(obj: unknown): obj is DatabaseQueryError {
  return typeof obj === 'object' && obj !== null && 'success' in obj && (obj as any).success === false && 'error' in obj;
}

// =============================================================================
// Utility Types
// =============================================================================

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// =============================================================================
// Environment-specific Types
// =============================================================================

export interface ElectronDatabaseConfig extends DatabaseConnectionConfig {
  readonly environment: 'ELECTRON';
  readonly directConnection: true;
}

export interface WebDatabaseConfig extends DatabaseConnectionConfig {
  readonly environment: 'WEB' | 'DOCKER';
  readonly apiUrl: string;
  readonly directConnection: false;
}

export type EnvironmentSpecificConfig = ElectronDatabaseConfig | WebDatabaseConfig;

// =============================================================================
// Enhanced MySQL Result Types
// =============================================================================

export interface EnhancedMysqlResult<T = unknown> {
  readonly success: boolean;
  readonly result?: T[] | QueryResultMeta;
  readonly fields?: ReadonlyArray<DatabaseFieldInfo>;
  readonly error?: string;
  readonly executionTime?: number;
  readonly rowCount?: number;
  readonly metadata?: {
    readonly query: string;
    readonly parameters?: ReadonlyArray<unknown>;
    readonly timestamp: string;
  };
}

// =============================================================================
// Connection Pool Types
// =============================================================================

export interface ConnectionPoolConfig {
  readonly connectionLimit: number;
  readonly host: string;
  readonly port: number;
  readonly user: string;
  readonly password: string;
  readonly database: string;
  readonly multipleStatements: boolean;
}

export interface ConnectionPoolStats {
  readonly totalConnections: number;
  readonly activeConnections: number;
  readonly idleConnections: number;
  readonly pendingConnections: number;
}

export interface ConnectionPoolState {
  readonly config: ConnectionPoolConfig;
  readonly stats: ConnectionPoolStats;
  readonly healthy: boolean;
  readonly lastError?: string;
}

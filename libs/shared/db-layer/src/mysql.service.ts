import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as mysql from 'mysql2';
import { Connection, ConnectionOptions, FieldPacket as FieldInfo, QueryError } from 'mysql2';
import { Observable, Subject, Subscriber } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  MysqlResult,
  TableRow,
  DatabaseConnectionRequest,
  DatabaseConnectionResult,
  DatabaseQueryRequest,
  DatabaseQueryResult,
  DatabaseStateResponse,
  DatabaseConnectionState,
  isDatabaseSuccessResponse,
  isDatabaseErrorResponse,
} from '@keira/shared/constants';
import { ElectronService } from '@keira/shared/common-services';
import { KEIRA_APP_CONFIG_TOKEN, KeiraAppConfig } from '@keira/shared/config';
import { KeiraConnectionOptions } from './mysql.model';
@Injectable({
  providedIn: 'root',
})
export class MysqlService {
  private readonly electronService = inject(ElectronService);
  private readonly ngZone = inject(NgZone);
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(KEIRA_APP_CONFIG_TOKEN);

  private mysql!: typeof mysql;
  private _connection!: Connection;
  private isWebEnvironment = false;

  private _config!: KeiraConnectionOptions;
  get config(): KeiraConnectionOptions {
    return this._config as KeiraConnectionOptions;
  }

  private _connectionEstablished = false;
  get connectionEstablished(): boolean {
    return this._connectionEstablished;
  }

  private _connectionLostSubject = new Subject<boolean>();
  readonly connectionLost$ = this._connectionLostSubject.asObservable();

  private _reconnecting = false;
  get reconnecting(): boolean {
    return this._reconnecting;
  }

  constructor() {
    /* istanbul ignore next */
    if (this.electronService.isElectron()) {
      this.mysql = window.require('mysql2');
      this.isWebEnvironment = false;
    } else {
      // Web environment - use HTTP API
      this.isWebEnvironment = true;
    }
  }

  getConnectionState(): DatabaseConnectionState {
    return this._connection ? DatabaseConnectionState.CONNECTED : DatabaseConnectionState.DISCONNECTED;
  }

  getConnectionStateViaAPI(): Observable<DatabaseStateResponse> {
    const apiUrl: string = this.appConfig.databaseApiUrl || '/api/database';

    return this.http.get<DatabaseStateResponse>(`${apiUrl}/state`);
  }

  connect(config: KeiraConnectionOptions) {
    this._config = config;
    this._config.multipleStatements = true;

    if (this.isWebEnvironment) {
      // Use HTTP API for web environment
      return this.connectViaAPI(config);
    } else {
      // Use direct mysql2 connection for Electron
      this._connection = this.mysql.createConnection(this.config);
      return new Observable((subscriber) => {
        this._connection.connect(this.getConnectCallback(subscriber));
      });
    }
  }

  private connectViaAPI(config: ConnectionOptions): Observable<void> {
    const apiUrl: string = this.appConfig.databaseApiUrl || '/api/database';
    const request: DatabaseConnectionRequest = { config };

    return this.http.post<DatabaseConnectionResult>(`${apiUrl}/connect`, request).pipe(
      map((response: DatabaseConnectionResult) => {
        this.ngZone.run(() => {
          if (isDatabaseSuccessResponse(response)) {
            this._connectionEstablished = true;
            // Set a dummy connection state for web environment
            this._connection = { state: DatabaseConnectionState.CONNECTED } as unknown as Connection;
          } else if (isDatabaseErrorResponse(response)) {
            const errorMessage = this.formatApiError(response);
            throw new Error(errorMessage);
          } else {
            throw new Error('Invalid response format');
          }
        });
      }),
      catchError((httpError: unknown) => {
        this.ngZone.run(() => {
          this._connectionEstablished = false;
        });

        // Enhanced error handling for HTTP errors
        if (this.isHttpErrorResponse(httpError)) {
          const errorMessage = this.formatHttpError(httpError);
          throw new Error(errorMessage);
        }

        throw httpError;
      }),
    );
  }

  private getConnectCallback(subscriber: Subscriber<void>) {
    return (err: QueryError | null) => {
      this.ngZone.run(() => {
        if (err) {
          this._connectionEstablished = false;
          subscriber.error(err);
        } else {
          this._connectionEstablished = true;
          this._connection.on('error', this.handleConnectionError.bind(this));
          subscriber.next();
        }
        subscriber.complete();
      });
    };
  }

  private handleConnectionError(error: { code: string }) {
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      this.reconnect();
    }
  }

  private reconnect() {
    this._reconnecting = true;
    this._connectionLostSubject.next(false);
    const RECONNECTION_TIME_MS = 500;
    console.info(`DB connection lost. Reconnecting in ${RECONNECTION_TIME_MS} ms...`);

    setTimeout(() => {
      this._connection = this.mysql.createConnection(this.config);
      this._connection.connect(this.reconnectCallback.bind(this));
    }, RECONNECTION_TIME_MS);
  }

  private reconnectCallback(err: QueryError | null) {
    this.ngZone.run(() => {
      if (err) {
        // reconnection failed
        this.reconnect();
      } else {
        // reconnection succeeded
        this._connectionLostSubject.next(true);
        this._reconnecting = false;
        this._connection.on('error', this.handleConnectionError.bind(this));
      }
    });
  }

  dbQuery<T extends TableRow>(queryString: string, values?: string[]): Observable<MysqlResult<T>> {
    if (this.isWebEnvironment) {
      return this.queryViaAPI<T>(queryString, values);
    }

    return new Observable<MysqlResult<T>>((subscriber) => {
      if (this.reconnecting) {
        console.error(`Reconnection in progress while trying to run query: ${queryString}`);
        return;
      }

      /* istanbul ignore next */
      if (this._connection) {
        // TODO: fix any, see https://github.com/sidorares/node-mysql2/issues/1654
        this._connection.query<any>(queryString, values, this.getQueryCallback<T>(subscriber));
        /* istanbul ignore else */
      } else if (
        /* istanbul ignore next */
        this.electronService.isElectron()
      ) {
        /* istanbul ignore next */
        console.error(`_connection was not defined when trying to run query: ${queryString}`);
      }
    });
  }

  private queryViaAPI<T extends TableRow>(queryString: string, values?: string[]): Observable<MysqlResult<T>> {
    const apiUrl: string = this.appConfig.databaseApiUrl || '/api/database';
    const request: DatabaseQueryRequest = {
      sql: queryString,
      params: values || [],
    };

    return this.http.post<DatabaseQueryResult<T>>(`${apiUrl}/query`, request).pipe(
      map((response: DatabaseQueryResult<T>) => {
        if (isDatabaseSuccessResponse(response)) {
          return {
            result: response.result as T[],
            fields: response.fields,
          } as MysqlResult<T>;
        } else if (isDatabaseErrorResponse(response)) {
          const errorMessage = this.formatApiError(response);
          throw new Error(errorMessage);
        } else {
          throw new Error('Invalid response format');
        }
      }),
      catchError((httpError: unknown) => {
        // Enhanced error handling for HTTP errors
        if (this.isHttpErrorResponse(httpError)) {
          const errorMessage = this.formatHttpError(httpError);
          console.error('Database query HTTP error:', errorMessage);
          throw new Error(errorMessage);
        }

        console.error('Database query error:', httpError);
        throw httpError;
      }),
    );
  }

  /**
   * Check if error is an HTTP error response
   */
  private isHttpErrorResponse(error: unknown): error is { status: number; error: any } {
    return typeof error === 'object' && error !== null && 'status' in error && 'error' in error;
  }

  /**
   * Format API error response for user display
   */
  private formatApiError(response: any): string {
    const baseMessage = response.error || 'Database operation failed';

    if (response.category) {
      const categoryMessages = {
        AUTHENTICATION: 'Authentication failed - check database credentials',
        CONNECTION: 'Database connection failed - check server availability',
        SYNTAX: 'SQL syntax error in query',
        CONSTRAINT: 'Database constraint violation',
        NOT_FOUND: 'Database resource not found',
        VALIDATION: 'Invalid request parameters',
      };

      const categoryMessage = categoryMessages[response.category as keyof typeof categoryMessages];
      if (categoryMessage) {
        return `${categoryMessage}: ${baseMessage}`;
      }
    }

    // Include error code if available
    if (response.code) {
      return `${baseMessage} (${response.code})`;
    }

    return baseMessage;
  }

  /**
   * Format HTTP error for user display
   */
  private formatHttpError(httpError: { status: number; error: any }): string {
    const status = httpError.status;
    const errorBody = httpError.error;

    // Try to extract API error information
    if (errorBody && typeof errorBody === 'object') {
      if (errorBody.error) {
        return this.formatApiError(errorBody);
      }
    }

    // Fallback HTTP status messages
    const statusMessages: { [key: number]: string } = {
      400: 'Bad Request - Invalid query parameters',
      401: 'Unauthorized - Database access denied',
      403: 'Forbidden - Insufficient database privileges',
      404: 'Not Found - Database resource not found',
      422: 'Unprocessable Entity - Database constraint violation',
      500: 'Internal Server Error - Database operation failed',
      503: 'Service Unavailable - Database connection unavailable',
    };

    const statusMessage = statusMessages[status] || `HTTP Error ${status}`;
    return `${statusMessage}${errorBody ? ': ' + JSON.stringify(errorBody) : ''}`;
  }

  private getQueryCallback<T extends TableRow>(subscriber: Subscriber<unknown>) {
    return (err: QueryError | null, result?: T[], fields?: FieldInfo[]) => {
      this.ngZone.run(() => {
        if (err) {
          console.info(`Error when executing query: \n\n${err.stack}`);
          subscriber.error(err);
        } else {
          subscriber.next({ result, fields });
        }
        subscriber.complete();
      });
    };
  }
}

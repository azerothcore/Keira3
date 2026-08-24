import { Service, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectronService } from '@keira/shared/common-services';
import * as mysql from 'mysql2';
import { Connection, ConnectionOptions, FieldPacket as FieldInfo, QueryError } from 'mysql2';
import { Observable, Subject, Subscriber, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
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
import { KEIRA_APP_CONFIG_TOKEN, isWebLikeEnvironment } from '@keira/shared/config';
import * as ssh2 from 'ssh2';
import { KeiraConnectionOptions } from './mysql.model';
@Service()
export class MysqlService {
  private readonly electronService = inject(ElectronService);
  private readonly ngZone = inject(NgZone);
  private readonly http = inject(HttpClient, { optional: true })!;
  private readonly appConfig = inject(KEIRA_APP_CONFIG_TOKEN, { optional: true });

  private mysql!: typeof mysql;
  private ssh2!: typeof ssh2;
  private _connection!: Connection;
  private isWebEnvironment = false;
  private _sshClient: ssh2.Client | null = null;
  private _sshTunnelActive = false;
  get sshTunnelActive(): boolean {
    return this._sshTunnelActive;
  }

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

  private _webSessionExpiredSubject = new Subject<void>();
  readonly webSessionExpired$ = this._webSessionExpiredSubject.asObservable();

  private _reconnecting = false;
  get reconnecting(): boolean {
    return this._reconnecting;
  }

  constructor() {
    /* istanbul ignore next */
    if (this.electronService.isElectron()) {
      this.mysql = window.require('mysql2');
      this.ssh2 = window.require('ssh2');
      this.isWebEnvironment = false;
    } else if (isWebLikeEnvironment(this.appConfig)) {
      // Web environment - use HTTP API
      this.isWebEnvironment = true;
    }
  }

  getConnectionState(): DatabaseConnectionState {
    return this._connection ? DatabaseConnectionState.CONNECTED : DatabaseConnectionState.DISCONNECTED;
  }

  getConnectionStateViaAPI(): Observable<DatabaseStateResponse> {
    const apiUrl: string = this.appConfig?.databaseApiUrl || '/api/database';

    return this.http.get<DatabaseStateResponse>(`${apiUrl}/state`);
  }

  /** Web mode: probe the server-side pool state; no credentials involved. */
  connectWeb(): Observable<boolean> {
    return this.getConnectionStateViaAPI().pipe(
      map((response) => response.state === DatabaseConnectionState.CONNECTED),
      catchError(() => of(false)),
      tap((connected) => {
        if (connected) {
          this._connectionEstablished = true;
          this._connection = { state: DatabaseConnectionState.CONNECTED } as unknown as Connection;
        } else {
          // A non-CONNECTED probe (or probe failure) must not leave stale connection state behind
          this._connectionEstablished = false;
          this._connection = undefined as unknown as Connection;
        }
      }),
    );
  }

  /** Web mode: drop the session-backed connection (e.g. after a 401). */
  disconnectWeb(): void {
    const wasEstablished = this._connectionEstablished;
    this._connectionEstablished = false;
    this._connection = undefined as unknown as Connection;
    if (wasEstablished) {
      this._webSessionExpiredSubject.next();
    }
  }

  // this conversion clean the config object from ssh and ssl related properties that mysql2 does not expect when ssh is disabled
  private toMysqlConfig(config: KeiraConnectionOptions): mysql.ConnectionOptions {
    const {
      sslEnabled: _sslEnabled,
      sshEnabled: _sshEnabled,
      sshHost: _sshHost,
      sshPort: _sshPort,
      sshUser: _sshUser,
      sshPassword: _sshPassword,
      sshPrivateKey: _sshPrivateKey,
      ...mysqlConfig
    } = config;

    return mysqlConfig;
  }

  connect(config: KeiraConnectionOptions) {
    this._config = config;
    this._config.multipleStatements = true;

    if (this.isWebEnvironment) {
      // Use HTTP API for web environment
      return this.connectViaAPI(config);
    }

    if (config.sshEnabled) {
      return this.connectViaSshTunnel(config);
    }

    // Use direct mysql2 connection for Electron
    this._connection = this.mysql.createConnection(this.toMysqlConfig(this.config));

    return new Observable((subscriber) => {
      this._connection.connect(this.getConnectCallback(subscriber));
    });
  }

  private connectViaAPI(config: ConnectionOptions): Observable<void> {
    const apiUrl: string = this.appConfig?.databaseApiUrl || '/api/database';
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
          // Clear any stale connection sentinel so getConnectionState() doesn't report CONNECTED
          this._connection = undefined as unknown as Connection;
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

  private connectViaSshTunnel(config: KeiraConnectionOptions): Observable<void> {
    return new Observable((subscriber) => {
      this.closeSshTunnel();

      const sshClient = new this.ssh2.Client();
      this._sshClient = sshClient;

      const sshConfig: ssh2.ConnectConfig = {
        host: config.sshHost,
        port: config.sshPort || 22,
        username: config.sshUser,
      };

      if (config.sshPrivateKey) {
        sshConfig.privateKey = config.sshPrivateKey;
        if (config.sshPassword) {
          sshConfig.passphrase = config.sshPassword;
        }
      } else {
        sshConfig.password = config.sshPassword;
      }

      sshClient.on('ready', () => {
        this._sshTunnelActive = true;

        const dbHost = config.host || '127.0.0.1';
        const dbPort = config.port || 3306;

        sshClient.forwardOut('127.0.0.1', 0, dbHost, dbPort, (err, stream) => {
          if (err) {
            this.ngZone.run(() => {
              this._sshTunnelActive = false;
              subscriber.error(err);
              subscriber.complete();
            });
            return;
          }

          const mysqlConfig = { ...this.toMysqlConfig(this.config), stream, host: undefined, port: undefined };
          this._connection = this.mysql.createConnection(mysqlConfig);
          this._connection.connect(this.getConnectCallback(subscriber));
        });
      });

      sshClient.on('close', () => {
        this.ngZone.run(() => {
          this._sshTunnelActive = false;
        });
      });

      sshClient.on('error', (err) => {
        this.ngZone.run(() => {
          this._sshTunnelActive = false;
          subscriber.error(err);
          subscriber.complete();
        });
      });

      sshClient.connect(sshConfig);
    });
  }

  private closeSshTunnel(): void {
    if (this._sshClient) {
      this._sshClient.end();
      this._sshClient = null;
      this._sshTunnelActive = false;
    }
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
      if (this.config?.sshEnabled) {
        this.connectViaSshTunnel(this.config).subscribe({
          next: () => this.reconnectCallback(null),
          error: () => this.reconnect(),
        });
      } else {
        this._connection = this.mysql.createConnection(this.toMysqlConfig(this.config));
        this._connection.connect(this.reconnectCallback.bind(this));
      }
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
    const apiUrl: string = this.appConfig?.databaseApiUrl || '/api/database';
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

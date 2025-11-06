import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as mysql from 'mysql2';
import { Connection, FieldPacket as FieldInfo, QueryError } from 'mysql2';
import { Observable, Subject, Subscriber } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  DatabaseConnectionRequest,
  DatabaseConnectionResult,
  DatabaseConnectionState,
  DatabaseQueryRequest,
  DatabaseQueryResult,
  DatabaseStateResponse,
  MysqlResult,
  TableRow,
  isDatabaseErrorResponse,
  isDatabaseSuccessResponse,
} from '@keira/shared/constants';
import { ElectronService } from '@keira/shared/common-services';
import { KEIRA_APP_CONFIG_TOKEN, KeiraAppConfig } from '@keira/shared/config';

@Injectable({
  providedIn: 'root',
})
export class MysqlService {
  private readonly electronService = inject(ElectronService);
  private readonly ngZone = inject(NgZone);
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject<KeiraAppConfig>(KEIRA_APP_CONFIG_TOKEN);

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
      this.isWebEnvironment = true;
    }
  }

  getConnectionState(): DatabaseConnectionState {
    return this._connection ? DatabaseConnectionState.CONNECTED : DatabaseConnectionState.DISCONNECTED;
  }

  getConnectionStateViaAPI(): Observable<DatabaseStateResponse> {
    const apiUrl = this.resolveApiUrl();
    return this.http.get<DatabaseStateResponse>(`${apiUrl}/state`);
  }

  connect(config: KeiraConnectionOptions) {
    this._config = config;
    this._config.multipleStatements = true;

    if (this.isWebEnvironment) {
      return this.connectViaAPI(config);
    }

    this._connection = this.mysql.createConnection(this.config);

    return new Observable((subscriber) => {
      this._connection.connect(this.getConnectCallback(subscriber));
    });
  }

  private connectViaAPI(config: ConnectionOptions): Observable<void> {
    const apiUrl = this.resolveApiUrl();
    const request: DatabaseConnectionRequest = { config };

    return this.http.post<DatabaseConnectionResult>(`${apiUrl}/connect`, request).pipe(
      map((response) => {
        this.ngZone.run(() => {
          if (isDatabaseSuccessResponse(response)) {
            this._connectionEstablished = true;
            this._connection = { state: DatabaseConnectionState.CONNECTED } as unknown as Connection;
          } else if (isDatabaseErrorResponse(response)) {
            throw new Error(this.formatApiError(response));
          } else {
            throw new Error('Invalid response format');
          }
        });
      }),
      catchError((error) => {
        this.ngZone.run(() => {
          this._connectionEstablished = false;
        });

        if (this.isHttpErrorResponse(error)) {
          throw new Error(this.formatHttpError(error));
        }

        throw error;
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
      return this.queryViaAPI(queryString, values);
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
    const apiUrl = this.resolveApiUrl();
    const request: DatabaseQueryRequest = {
      sql: queryString,
      params: values || [],
    };

    return this.http.post<DatabaseQueryResult<T>>(`${apiUrl}/query`, request).pipe(
      map((response) => {
        if (isDatabaseSuccessResponse(response)) {
          return {
            result: response.result as T[],
            fields: response.fields,
          } as MysqlResult<T>;
        }

        if (isDatabaseErrorResponse(response)) {
          throw new Error(this.formatApiError(response));
        }

        throw new Error('Invalid response format');
      }),
      catchError((error) => {
        if (this.isHttpErrorResponse(error)) {
          const message = this.formatHttpError(error);
          console.error('Database query HTTP error:', message);
          throw new Error(message);
        }

        console.error('Database query error:', error);
        throw error;
      }),
    );
  }

  private resolveApiUrl(): string {
    return this.appConfig.databaseApiUrl || '/api/database';
  }

  private isHttpErrorResponse(error: unknown): error is { status: number; error?: unknown } {
    return typeof error === 'object' && error !== null && 'status' in error;
  }

  private formatApiError(response: { error: string; category?: string; code?: string }): string {
    const baseMessage = response.error || 'Database operation failed';
    if (response.category) {
      return `${response.category}: ${baseMessage}`;
    }
    return response.code ? `${baseMessage} (${response.code})` : baseMessage;
  }

  private formatHttpError(error: { status: number; error?: unknown }): string {
    const statusMessages: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      422: 'Unprocessable Entity',
      500: 'Internal Server Error',
      503: 'Service Unavailable',
    };

    const statusMessage = statusMessages[error.status] || `HTTP Error ${error.status}`;
    return error.error ? `${statusMessage}: ${JSON.stringify(error.error)}` : statusMessage;
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

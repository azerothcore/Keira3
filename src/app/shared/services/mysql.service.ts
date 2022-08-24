import { Injectable, NgZone } from '@angular/core';
import * as mysql from 'mysql2';
import { Connection, ConnectionOptions as ConnectionConfig, FieldPacket as FieldInfo, QueryError as MysqlError } from 'mysql2';
import { Observable, Subject } from 'rxjs';
import { MysqlResult, TableRow } from '../types/general';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root',
})
export class MysqlService {
  private mysql: typeof mysql;
  private _connection: Connection;

  private _config: ConnectionConfig;
  get config(): ConnectionConfig {
    return this._config;
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

  constructor(private electronService: ElectronService, private ngZone: NgZone) {
    /* istanbul ignore next */
    if (this.electronService.isElectron()) {
      this.mysql = window.require('mysql2');
    }
  }

  getConnectionState() {
    return this._connection ? 'connected' : null
  }

  connect(config: ConnectionConfig) {
    this._config = config;
    this._config.multipleStatements = true;

    this._connection = this.mysql.createConnection(this.config);

    return new Observable((subscriber) => {
      this._connection.connect(this.getConnectCallback(subscriber));
    });
  }

  private getConnectCallback(subscriber) {
    return (err: MysqlError) => {
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

  private handleConnectionError(error) {
    if (error.code === 'PROTOCOL_CONNECTION_LOST') {
      this.reconnect();
    }
  }

  private reconnect() {
    this._reconnecting = true;
    this._connectionLostSubject.next(false);
    const RECONNECTION_TIME_MS = 500;
    console.log(`DB connection lost. Reconnecting in ${RECONNECTION_TIME_MS} ms...`);

    setTimeout(() => {
      this._connection = this.mysql.createConnection(this.config);
      this._connection.connect(this.reconnectCallback.bind(this));
    }, RECONNECTION_TIME_MS);
  }

  private reconnectCallback(err: MysqlError) {
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
    return new Observable<MysqlResult<T>>((subscriber) => {
      if (this.reconnecting) {
        console.error(`Reconnection in progress while trying to run query: ${queryString}`);
        return;
      }

      if (this._connection) {
        this._connection.query(queryString, values, this.getQueryCallback<T>(subscriber));
        /* istanbul ignore else */
      } /* istanbul ignore next */ else if (this.electronService.isElectron()) {
        console.error(`_connection was not defined when trying to run query: ${queryString}`);
      }
    });
  }

  private getQueryCallback<T extends TableRow>(subscriber): any {
    return (err: MysqlError, results?: T[], fields?: FieldInfo[]) => {
      this.ngZone.run(() => {
        if (err) {
          console.log(`Error when executing query: \n\n${err.stack}`);
          subscriber.error(err);
        } else {
          subscriber.next({ results, fields });
        }
        subscriber.complete();
      });
    };
  }
}

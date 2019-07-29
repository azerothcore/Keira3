import { Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import * as mysql from 'mysql';
import { Connection, ConnectionConfig, FieldInfo, MysqlError } from 'mysql';

import { ElectronService } from './electron.service';
import { MysqlResult, TableRow } from '../types/general';


@Injectable({
  providedIn: 'root'
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

  constructor(
    private electronService: ElectronService,
    private ngZone: NgZone,
  ) {
    /* istanbul ignore next */
    if (this.electronService.isElectron()) {
      this.mysql = window.require('mysql');
    }
  }

  getConnectionState() {
    return this._connection ? this._connection.state : null;
  }

  connect(config: ConnectionConfig) {
    this._config = config;
    this._config.multipleStatements = true;

    this._connection = this.mysql.createConnection(this.config);

    return new Observable(subscriber => {
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
          subscriber.next();
        }
        subscriber.complete();
      });
    };
  }

  dbQuery<T extends TableRow>(queryString: string, values?: string[]): Observable<MysqlResult<T>> {
    return new Observable<MysqlResult<T>>(subscriber => {
      this._connection.query(queryString, values, this.getQueryCallback<T>(subscriber));
    });
  }

  private getQueryCallback<T extends TableRow>(subscriber) {
    return (err: MysqlError, results?: T[], fields?: FieldInfo[]) => {
      this.ngZone.run(() => {
        if (err) {
          subscriber.error(err);
        } else {
          subscriber.next({results, fields});
        }
        subscriber.complete();
      });
    };
  }
}

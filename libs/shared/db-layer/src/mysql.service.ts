import { Injectable, NgZone, inject } from '@angular/core';
import { ElectronService } from '@keira/shared/common-services';
import { MysqlResult, TableRow } from '@keira/shared/constants';
import * as mysql from 'mysql2';
import { Connection, FieldPacket as FieldInfo, QueryError } from 'mysql2';
import * as ssh2 from 'ssh2';
import { Observable, Subject, Subscriber } from 'rxjs';
import { KeiraConnectionOptions } from './mysql.model';
@Injectable({
  providedIn: 'root',
})
export class MysqlService {
  private readonly electronService = inject(ElectronService);
  private readonly ngZone = inject(NgZone);

  private mysql!: typeof mysql;
  private ssh2!: typeof ssh2;
  private _connection!: Connection;
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

  private _reconnecting = false;
  get reconnecting(): boolean {
    return this._reconnecting;
  }

  constructor() {
    /* istanbul ignore next */
    if (this.electronService.isElectron()) {
      this.mysql = window.require('mysql2');
      this.ssh2 = window.require('ssh2');
    }
  }

  getConnectionState(): string {
    return this._connection ? 'CONNECTED' : 'EMPTY';
  }

  connect(config: KeiraConnectionOptions) {
    this._config = config;
    this._config.multipleStatements = true;

    if (config.sshEnabled) {
      return this.connectViaSshTunnel(config);
    }

    this._connection = this.mysql.createConnection(this.config);

    return new Observable((subscriber) => {
      this._connection.connect(this.getConnectCallback(subscriber));
    });
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

          const mysqlConfig = { ...this.config, stream, host: undefined, port: undefined };
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
        this._connection = this.mysql.createConnection(this.config);
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

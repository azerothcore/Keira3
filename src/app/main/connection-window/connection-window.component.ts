import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from 'ngx-typesafe-forms';
import { ConnectionConfig, MysqlError } from 'mysql';
import { version } from '../../../../package.json';

import { MysqlService } from '../../shared/services/mysql.service';
import { SubscriptionHandler } from '../../shared/utils/subscription-handler/subscription-handler';
import { Config } from '@keira-types/config.type';
import { LocalStorageService } from '../../shared/services/local-storage.service';

@Component({
  selector: 'keira-connection-window',
  templateUrl: './connection-window.component.html',
  styleUrls: ['./connection-window.component.scss']
})
export class ConnectionWindowComponent extends SubscriptionHandler implements OnInit {

  private readonly IMAGES_COUNT = 10;
  public readonly RANDOM_IMAGE = Math.floor(Math.random() * this.IMAGES_COUNT) + 1;
  public readonly KEIRA_VERSION = version;
  private configStorage: Config;
  form: FormGroup<Partial<ConnectionConfig>>;
  error: MysqlError;

  constructor(
    private mysqlService: MysqlService,
    private localstorageService: LocalStorageService,
  ) {
    super();
  }

  ngOnInit() {

    this.form = new FormGroup({
      'host': new FormControl('127.0.0.1'),
      'port': new FormControl(3306),
      'user': new FormControl('root'),
      'password': new FormControl('root'),
      'database': new FormControl('acore_world'),
    });

    this.configStorage = JSON.parse(localStorage.getItem('config'));

    if (!!this.configStorage) {
      this.form.setValue({
        host: this.configStorage.host,
        port: Number(this.configStorage.port),
        user: this.configStorage.user,
        password: atob(this.configStorage.keira3String),
        database: this.configStorage.database,
      });
    }
  }

  onConnect() {
    const tmpValues = this.form.getRawValue();
    this.configStorage = {
      host: tmpValues.host,
      port: String(tmpValues.port),
      user: tmpValues.user,
      keira3String: btoa(tmpValues.password),
      database: tmpValues.database,
    };
    this.localstorageService.setItem('config', JSON.stringify(this.configStorage));

    this.subscriptions.push(
      this.mysqlService.connect(this.form.getRawValue()).subscribe(() => {
        this.error = null;
      }, (error: MysqlError) => {
        this.error = error;
      })
    );
  }
}

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MysqlError } from 'mysql';
import { version } from '../../../../package.json';

import { MysqlService } from '../../services/mysql.service';
import { SubscriptionHandler } from '../../utils/subscription-handler/subscription-handler';
import { Config } from '../../types/config.type.js';
import { LocalStorageService } from '../../services/localstorage.service';

@Component({
  selector: 'app-connection-window',
  templateUrl: './connection-window.component.html',
  styleUrls: ['./connection-window.component.scss']
})
export class ConnectionWindowComponent extends SubscriptionHandler implements OnInit {

  public readonly KEIRA_VERSION = version;
  private configStorage: Config;
  form: FormGroup;
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
      'port': new FormControl('3306'),
      'user': new FormControl('root'),
      'password': new FormControl('root'),
      'database': new FormControl('acore_world'),
    });

    this.configStorage = JSON.parse(localStorage.getItem('config'));

    if (!!this.configStorage) {
      this.form.setValue({
        host: this.configStorage.host,
        port: this.configStorage.port,
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
      port: tmpValues.port,
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

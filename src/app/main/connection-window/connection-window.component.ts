import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from 'ngx-typesafe-forms';
import { ConnectionConfig, MysqlError } from 'mysql';
import { version } from '../../../../package.json';

import { MysqlService } from '../../shared/services/mysql.service';
import { SubscriptionHandler } from '../../shared/utils/subscription-handler/subscription-handler';
import { ConnectionWindowService } from './connection-window.service';

@Component({
  selector: 'keira-connection-window',
  templateUrl: './connection-window.component.html',
  styleUrls: ['./connection-window.component.scss']
})
export class ConnectionWindowComponent extends SubscriptionHandler implements OnInit {

  private readonly IMAGES_COUNT = 10;
  public readonly RANDOM_IMAGE = Math.floor(Math.random() * this.IMAGES_COUNT) + 1;
  public readonly KEIRA_VERSION = version;
  configs: Partial<ConnectionConfig>[];
  form: FormGroup<Partial<ConnectionConfig>>;
  error: MysqlError;

  constructor(
    private mysqlService: MysqlService,
    private connectionWindowService: ConnectionWindowService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      'host': new FormControl('127.0.0.1'),
      'port': new FormControl(3306),
      'user': new FormControl('root'),
      'password': new FormControl('root'),
      'database': new FormControl('acore_world'),
    });

    this.configs = this.connectionWindowService.getConfigs();

    if (this.configs.length > 0) {
      // get last saved config
      this.form.setValue(this.configs[this.configs.length - 1]);
    }
  }

  /* istanbul ignore next */ // TODO: will be tested when the feature is enabled
  loadConfig(config: Partial<ConnectionConfig>): void {
    this.form.setValue(config);
  }

  /* istanbul ignore next */ // TODO: will be tested when the feature is enabled
  removeAllConfigs(): void {
    this.connectionWindowService.removeAllConfigs();
  }

  onConnect(): void {
    this.subscriptions.push(
      this.mysqlService.connect(this.form.getRawValue()).subscribe(() => {
        this.connectionWindowService.saveNewConfig(this.form.getRawValue());
        this.error = null;
      }, (error: MysqlError) => {
        this.error = error;
      })
    );
  }
}

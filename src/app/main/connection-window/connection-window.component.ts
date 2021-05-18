import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from 'ngx-typesafe-forms';
import { ConnectionConfig, MysqlError } from 'mysql';
import packageInfo from '../../../../package.json';

import { MysqlService } from '../../shared/services/mysql.service';
import { SubscriptionHandler } from '../../shared/utils/subscription-handler/subscription-handler';
import { ConnectionWindowService } from './connection-window.service';

@Component({
  selector: 'keira-connection-window',
  templateUrl: './connection-window.component.html',
  styleUrls: ['./connection-window.component.scss'],
})
export class ConnectionWindowComponent extends SubscriptionHandler implements OnInit {
  private readonly IMAGES_COUNT = 10;
  public readonly RANDOM_IMAGE = Math.floor(Math.random() * this.IMAGES_COUNT) + 1;
  public readonly KEIRA_VERSION = packageInfo.version;
  configs: Partial<ConnectionConfig>[];
  // TODO remove 'any' type hack once this is solved: https://github.com/dirkluijk/ngx-typesafe-forms/issues/26
  form: FormGroup<any>;
  // form: FormGroup<Partial<ConnectionConfig>>;
  error: MysqlError;
  savePassword = true;

  get isRecentDropdownDisabled(): boolean {
    return !this.configs || this.configs.length === 0;
  }

  constructor(private mysqlService: MysqlService, private connectionWindowService: ConnectionWindowService) {
    super();
  }

  ngOnInit(): void {
    // TODO remove 'any' type hack once this is solved: https://github.com/dirkluijk/ngx-typesafe-forms/issues/26
    this.form = new FormGroup<any>({
      host: new FormControl<any>('127.0.0.1'),
      port: new FormControl<any>(3306),
      user: new FormControl<any>('root'),
      password: new FormControl<any>('root'),
      database: new FormControl<any>('acore_world'),
    });

    this.configs = this.connectionWindowService.getConfigs();

    if (this.configs?.length > 0) {
      // get last saved config
      // TODO remove 'as any' type hack once this is solved: https://github.com/dirkluijk/ngx-typesafe-forms/issues/26
      this.form.setValue(this.configs[this.configs.length - 1] as any);

      if (!this.form.getRawValue().password) {
        this.savePassword = false;
      }
    }
  }

  loadConfig(config: Partial<ConnectionConfig>): void {
    this.form.setValue(config);
  }

  removeAllConfigs(): void {
    this.connectionWindowService.removeAllConfigs();
    this.configs = [];
    this.form.reset();
  }

  onConnect(): void {
    this.subscriptions.push(
      this.mysqlService.connect(this.form.getRawValue()).subscribe(
        () => {
          const newConfig = this.form.getRawValue();
          if (!this.savePassword) {
            newConfig.password = '';
          }
          this.connectionWindowService.saveNewConfig(newConfig);
          this.error = null;
        },
        (error: MysqlError) => {
          this.error = error;
        },
      ),
    );
  }
}

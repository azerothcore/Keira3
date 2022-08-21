import { Component, OnInit } from '@angular/core';
import { ConnectionConfig, MysqlError } from 'mysql';
import { FormControl, FormGroup } from 'ngx-typesafe-forms';
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
  readonly RANDOM_IMAGE = Math.floor(Math.random() * this.IMAGES_COUNT) + 1;
  readonly KEIRA_VERSION = packageInfo.version;
  configs: Partial<ConnectionConfig>[];
  form: FormGroup<Partial<ConnectionConfig>>;
  error: MysqlError;
  savePassword = true;

  get isRecentDropdownDisabled(): boolean {
    return !this.configs || this.configs.length === 0;
  }

  constructor(private mysqlService: MysqlService, private connectionWindowService: ConnectionWindowService) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup<ConnectionConfig>({
      host: new FormControl<string>('127.0.0.1'),
      port: new FormControl<number>(3306),
      user: new FormControl<string>('root'),
      password: new FormControl<string>('root'),
      database: new FormControl<string>('acore_world'),
    });

    this.configs = this.connectionWindowService.getConfigs();

    if (this.configs?.length > 0) {
      // get last saved config
      this.form.setValue(this.configs[this.configs.length - 1]);

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
      this.mysqlService.connect(this.form.getRawValue()).subscribe({
        next: () => {
          const newConfig = this.form.getRawValue();
          if (!this.savePassword) {
            newConfig.password = '';
          }
          this.connectionWindowService.saveNewConfig(newConfig);
          this.error = null;
        },
        error: (error: MysqlError) => {
          this.error = error;
        },
      }),
    );
  }
}

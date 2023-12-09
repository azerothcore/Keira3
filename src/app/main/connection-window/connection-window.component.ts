import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ModelForm } from '@keira-shared/utils/helpers';
import { ConnectionOptions, QueryError } from 'mysql2';
import packageInfo from '../../../../package.json';
import { MysqlService } from '../../shared/services/mysql.service';
import { SubscriptionHandler } from '../../shared/utils/subscription-handler/subscription-handler';
import { ConnectionWindowService } from './connection-window.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-connection-window',
  templateUrl: './connection-window.component.html',
  styleUrls: ['./connection-window.component.scss'],
})
export class ConnectionWindowComponent extends SubscriptionHandler implements OnInit {
  private readonly IMAGES_COUNT = 11;
  readonly RANDOM_IMAGE = Math.floor(Math.random() * this.IMAGES_COUNT) + 1;
  readonly KEIRA_VERSION = packageInfo.version;
  configs: Partial<ConnectionOptions>[];
  form: FormGroup<ModelForm<Partial<ConnectionOptions>>>;
  error: QueryError;
  savePassword = true;
  rememberMe = true;

  get isRecentDropdownDisabled(): boolean {
    return !this.configs || this.configs.length === 0;
  }

  constructor(
    private readonly mysqlService: MysqlService,
    private readonly connectionWindowService: ConnectionWindowService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.form = new FormGroup<ModelForm<Partial<ConnectionOptions>>>({
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

      if (this.connectionWindowService.isRememberMeEnabled()) {
        this.onConnect();
      }
    }
  }

  loadConfig(config: Partial<ConnectionOptions>): void {
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
          this.connectionWindowService.saveRememberPreference(this.rememberMe);
          this.connectionWindowService.saveNewConfig(newConfig);
          this.error = null;
        },
        error: (error: QueryError) => {
          this.error = error;
        },
      }),
    );
  }
}

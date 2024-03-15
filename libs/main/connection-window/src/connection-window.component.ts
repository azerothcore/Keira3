import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ConnectionOptions, QueryError } from 'mysql2';
// eslint-disable-next-line @nx/enforce-module-boundaries
import packageInfo from '../../../../package.json';

import { ModelForm, SubscriptionHandler } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { NgIf, NgFor } from '@angular/common';
import { LoginConfigService } from '@keira/shared/login-config';
import { SwitchLanguageComponent } from '@keira/shared/switch-language';
import { MysqlService } from '@keira/shared/db-layer';
import { QueryErrorComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-connection-window',
  templateUrl: './connection-window.component.html',
  styleUrls: ['./connection-window.component.scss'],
  standalone: true,
  imports: [NgIf, FormsModule, ReactiveFormsModule, BsDropdownModule, NgFor, TranslateModule, QueryErrorComponent, SwitchLanguageComponent],
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
    private readonly loginConfigService: LoginConfigService,
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

    this.configs = this.loginConfigService.getConfigs();

    if (this.configs?.length > 0) {
      // get last saved config
      this.form.setValue(this.configs[this.configs.length - 1]);

      if (!this.form.getRawValue().password) {
        this.savePassword = false;
      }

      if (this.loginConfigService.isRememberMeEnabled()) {
        this.onConnect();
      }
    }
  }

  loadConfig(config: Partial<ConnectionOptions>): void {
    this.form.setValue(config);
  }

  removeAllConfigs(): void {
    this.loginConfigService.removeAllConfigs();
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
          this.loginConfigService.saveRememberPreference(this.rememberMe);
          this.loginConfigService.saveNewConfig(newConfig);
          this.error = null;
        },
        error: (error: QueryError) => {
          this.error = error;
        },
      }),
    );
  }
}

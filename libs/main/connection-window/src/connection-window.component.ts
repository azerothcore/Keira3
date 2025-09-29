import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { QueryError } from 'mysql2';
// eslint-disable-next-line @nx/enforce-module-boundaries
import packageInfo from '../../../../package.json';

import { TranslateModule } from '@ngx-translate/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

import { QueryErrorComponent } from '@keira/shared/base-editor-components';
import { MysqlService } from '@keira/shared/db-layer';
import { LoginConfigService } from '@keira/shared/login-config';
import { SwitchLanguageComponent } from '@keira/shared/switch-language';
import { ModelForm, SubscriptionHandler } from '@keira/shared/utils';
import { KeiraConnectionOptions } from './connection-window.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-connection-window',
  templateUrl: './connection-window.component.html',
  styleUrls: ['./connection-window.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule,
    TranslateModule,
    TooltipModule,
    QueryErrorComponent,
    SwitchLanguageComponent,
  ],
})
export class ConnectionWindowComponent extends SubscriptionHandler implements OnInit {
  private readonly mysqlService = inject(MysqlService);
  private readonly loginConfigService = inject(LoginConfigService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  private readonly IMAGES_COUNT = 11;
  readonly RANDOM_IMAGE = Math.floor(Math.random() * this.IMAGES_COUNT) + 1;
  readonly KEIRA_VERSION = packageInfo.version;
  configs: Partial<KeiraConnectionOptions>[] | undefined;
  form!: FormGroup<ModelForm<Partial<KeiraConnectionOptions>>>;
  error: QueryError | undefined;
  savePassword = true;
  rememberMe = true;
  sslEnabled = false;

  get isRecentDropdownDisabled(): boolean {
    return !this.configs || this.configs.length === 0;
  }

  ngOnInit(): void {
    this.form = new FormGroup<ModelForm<Partial<KeiraConnectionOptions>>>({
      host: new FormControl<string>('127.0.0.1') as FormControl<string>,
      port: new FormControl<number>(3306) as FormControl<number>,
      user: new FormControl<string>('root') as FormControl<string>,
      password: new FormControl<string>('root') as FormControl<string>,
      database: new FormControl<string>('acore_world') as FormControl<string>,
    });

    this.configs = this.loginConfigService.getConfigs();

    if (this.configs?.length > 0) {
      // get last saved config
      const lastConfig = this.configs[this.configs.length - 1];
      this.form.setValue(lastConfig);

      // Restore SSL preference if it was saved with the config
      this.sslEnabled = !!lastConfig.sslEnabled;

      if (!this.form.getRawValue().password) {
        this.savePassword = false;
      }

      if (this.loginConfigService.isRememberMeEnabled()) {
        this.onConnect();
      }
    }
  }

  loadConfig(config: Partial<KeiraConnectionOptions>): void {
    this.form.setValue(config);
    // Restore SSL preference if it was saved with the config
    this.sslEnabled = !!config.sslEnabled;
  }

  removeAllConfigs(): void {
    this.loginConfigService.removeAllConfigs();
    this.configs = [];
    this.form.reset();
  }

  onConnect(): void {
    const connectionConfig = this.form.getRawValue();

    // Add SSL configuration if SSL is enabled
    if (this.sslEnabled) {
      connectionConfig.ssl = {
        rejectUnauthorized: false, // Allow self-signed certificates
      };
    }

    this.subscriptions.push(
      this.mysqlService.connect(connectionConfig).subscribe({
        next: () => {
          const newConfig = this.form.getRawValue();
          if (!this.savePassword) {
            newConfig.password = '';
          }
          // Save SSL preference with the config
          newConfig.sslEnabled = this.sslEnabled;

          this.loginConfigService.saveRememberPreference(this.rememberMe);
          this.loginConfigService.saveNewConfig(newConfig);
          this.error = undefined;
          this.changeDetectorRef.markForCheck();
        },
        error: (error: QueryError) => {
          this.error = error;
        },
      }),
    );
  }
}

import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { isDatabaseName, ServerSettingsService } from '@keira/shared/common-services';
import { TranslatePipe } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard';
import { generateAccountName, generatePassword, SoapAccountService } from './soap-account.service';

/**
 * Making the SOAP account from Keira, when asked (it's a full GM account): a generated name and password, made in the
 * auth database with Keira's login, or copied as SQL to run elsewhere.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-soap-account',
  imports: [TranslatePipe],
  template: `
    <div class="form-check mt-2">
      <input
        class="form-check-input"
        type="checkbox"
        id="soap-account-wanted"
        data-testid="soap-account-wanted"
        [checked]="wanted()"
        (change)="wanted.set($any($event.target).checked)"
      />
      <label class="form-check-label" for="soap-account-wanted">{{ 'SETTINGS.SOAP_ACCOUNT_WANTED' | translate }}</label>
    </div>
    @if (wanted()) {
      <div class="soap-account border rounded p-2 mt-1" data-testid="soap-account">
        <p class="small text-muted mb-1">{{ 'SETTINGS.SOAP_ACCOUNT_HELP' | translate }}</p>
        <div class="row g-2 mb-2">
          <div class="col-6 col-md-3">
            <input
              class="form-control form-control-sm"
              data-testid="soap-account-name"
              maxlength="17"
              [placeholder]="'SETTINGS.SOAP_USER' | translate"
              [value]="name()"
              (input)="name.set($any($event.target).value)"
            />
          </div>
          <div class="col-6 col-md-3">
            <div class="input-group input-group-sm">
              <input
                class="form-control"
                data-testid="soap-account-password"
                maxlength="16"
                [placeholder]="'SETTINGS.SOAP_PASSWORD' | translate"
                [value]="password()"
                (input)="password.set($any($event.target).value)"
              />
              <button
                type="button"
                class="btn btn-outline-secondary"
                data-testid="soap-account-regenerate"
                [title]="'SETTINGS.SOAP_ACCOUNT_REGENERATE' | translate"
                (click)="regenerate()"
              >
                <i class="fa fa-sync"></i>
              </button>
            </div>
          </div>
          <div class="col-6 col-md-3">
            <div class="input-group input-group-sm">
              <span class="input-group-text">{{ 'SETTINGS.AUTH_DATABASE' | translate }}</span>
              <input
                class="form-control"
                data-testid="soap-account-database"
                [value]="server.settings().authDatabase"
                (change)="setAuthDatabase($any($event.target).value)"
              />
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-sm btn-primary me-1" data-testid="soap-account-create" [disabled]="busy()" (click)="create()">
          {{ 'SETTINGS.SOAP_ACCOUNT_CREATE' | translate }}
        </button>
        <button
          type="button"
          class="btn btn-sm btn-outline-secondary"
          data-testid="soap-account-copy"
          [disabled]="busy()"
          (click)="copySql()"
        >
          {{ 'SETTINGS.SOAP_ACCOUNT_COPY' | translate }}
        </button>
        @if (answer(); as answer) {
          <div
            class="small mt-1"
            [class.text-danger]="answer.failed"
            [class.text-success]="!answer.failed"
            data-testid="soap-account-answer"
          >
            {{ answer.failed ? answer.text : (answer.text | translate) }}
          </div>
        }
      </div>
    }
  `,
})
export class SoapAccountComponent {
  protected readonly server = inject(ServerSettingsService);
  private readonly accounts = inject(SoapAccountService);
  private readonly clipboard = inject(ClipboardService);
  protected readonly wanted = signal(false);
  protected readonly name = signal(generateAccountName());
  protected readonly password = signal(generatePassword());
  protected readonly busy = signal(false);
  protected readonly answer = signal<{ text: string; failed: boolean } | undefined>(undefined);
  /** Made: the SOAP login now (the settings test it). */
  readonly created = output<void>();

  protected regenerate(): void {
    this.name.set(generateAccountName());
    this.password.set(generatePassword());
  }

  protected setAuthDatabase(name: string): void {
    if (isDatabaseName(name.trim())) {
      this.server.save({ authDatabase: name.trim() });
    }
  }

  protected async create(): Promise<void> {
    await this.run(async () => {
      await this.accounts.create(this.name(), this.password());
      this.created.emit();
      return 'SETTINGS.SOAP_ACCOUNT_CREATED';
    });
  }

  protected async copySql(): Promise<void> {
    await this.run(async () => {
      this.clipboard.copyFromContent(await this.accounts.sql(this.name(), this.password()));
      return 'SETTINGS.SOAP_ACCOUNT_COPIED';
    });
  }

  private async run(action: () => Promise<string>): Promise<void> {
    this.busy.set(true);
    try {
      this.answer.set({ text: await action(), failed: false });
    } catch (error) {
      this.answer.set({ text: (error as Error).message, failed: true });
    } finally {
      this.busy.set(false);
    }
  }
}

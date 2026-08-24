import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
// eslint-disable-next-line @nx/enforce-module-boundaries
import packageInfo from '../../../../../package.json';
import { MysqlService } from '@keira/shared/db-layer';
import { WebAuthService } from '@keira/shared/login-config';
import { SubscriptionHandler } from '@keira/shared/utils';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-login-window',
  templateUrl: './login-window.component.html',
  styleUrls: ['./login-window.component.scss'],
  imports: [ReactiveFormsModule],
})
export class LoginWindowComponent extends SubscriptionHandler {
  private readonly webAuthService = inject(WebAuthService);
  private readonly mysqlService = inject(MysqlService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  readonly KEIRA_VERSION = packageInfo.version;
  readonly form = new FormGroup({
    username: new FormControl<string>('', { nonNullable: true }),
    password: new FormControl<string>('', { nonNullable: true }),
  });
  error: string | undefined;
  loading = false;

  onLogin(): void {
    this.loading = true;
    this.error = undefined;
    const { username, password } = this.form.getRawValue();

    this.subscriptions.push(
      this.webAuthService.login(username, password).subscribe({
        next: () => {
          this.subscriptions.push(
            this.mysqlService.connectWeb().subscribe((connected) => {
              this.loading = false;
              if (!connected) {
                this.error = 'Logged in, but the database is not reachable.';
              }
              this.changeDetectorRef.markForCheck();
            }),
          );
        },
        error: (err: unknown) => {
          this.loading = false;
          if (err instanceof HttpErrorResponse && err.status === 401) {
            this.error = 'Invalid username or password.';
          } else if (err instanceof HttpErrorResponse && err.status === 503) {
            this.error = 'Login is not configured on the server (set KEIRA_AUTH_USER and KEIRA_AUTH_PASSWORD).';
          } else {
            this.error = 'Unable to reach the server. Please try again.';
          }
          this.changeDetectorRef.markForCheck();
        },
      }),
    );
  }
}

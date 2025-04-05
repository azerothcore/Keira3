import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { KEIRA3_REPO_URL, LATEST_RELEASE_API_URL } from '@keira/shared/constants';

import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged } from 'rxjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import packageInfo from '../../../../package.json';

import { TranslateModule } from '@ngx-translate/core';

import { ConnectionWindowComponent } from '@keira/main/connection-window';
import { MainWindowComponent } from '@keira/main/main-window';
import { MysqlService, SqliteQueryService } from '@keira/shared/db-layer';
import { ElectronService } from '@keira/shared/common-services';
import { SubscriptionHandler } from '@keira/shared/utils';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  // TODO: currently OnPush would break the auto reconnect of the login page
  selector: 'keira-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [ConnectionWindowComponent, MainWindowComponent, TranslateModule],
})
export class AppComponent extends SubscriptionHandler implements OnInit {
  readonly KEIRA3_REPO_URL = KEIRA3_REPO_URL;
  showNewerVersionAlert = false;
  sqliteResult: { id: number; name: string } | undefined;

  readonly mysqlService = inject(MysqlService);
  readonly toastrService = inject(ToastrService);
  private readonly sqliteQueryService = inject(SqliteQueryService);
  private readonly electronService = inject(ElectronService);
  private readonly http = inject(HttpClient);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.handleConnectionLostAlerts();
    this.handleSqliteTest();
    this.handleNewerVersionAlert();
  }

  private handleSqliteTest(): void {
    /* istanbul ignore next */
    if (this.electronService.isElectron()) {
      this.subscriptions.push(
        this.sqliteQueryService
          .query<{ id: number; name: string }>('SELECT * FROM achievements WHERE id = 970', true)
          .subscribe((result) => {
            this.sqliteResult = result ? result[0] : undefined;
            this.changeDetectorRef.markForCheck();
          }),
      );
    }
  }

  private handleConnectionLostAlerts(): void {
    this.subscriptions.push(
      this.mysqlService.connectionLost$.pipe(distinctUntilChanged()).subscribe((status) => {
        if (!status) {
          this.toastrService.error('Database connection lost');
        } else {
          this.toastrService.success('Database reconnected');
        }
      }),
    );
  }

  private handleNewerVersionAlert(): void {
    this.subscriptions.push(
      this.http.get<{ tag_name: string }>(LATEST_RELEASE_API_URL).subscribe((release) => {
        const currentTag = `v${packageInfo.version}`;
        if (currentTag !== release.tag_name) {
          this.showNewerVersionAlert = true;
        }
      }),
    );
  }
}

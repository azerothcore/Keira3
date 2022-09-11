import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { KEIRA3_REPO_URL, LATEST_RELEASE_API_URL } from '@keira-constants/general';
import { ElectronService } from '@keira-shared/services/electron.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';
import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged } from 'rxjs';
import packageInfo from '../../../package.json';
import { MysqlService } from '../shared/services/mysql.service';

@Component({
  selector: 'keira-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent extends SubscriptionHandler implements OnInit {
  readonly KEIRA3_REPO_URL = KEIRA3_REPO_URL;
  showNewerVersionAlert = false;
  sqliteResult: { id: number; name: string };

  constructor(
    public mysqlService: MysqlService,
    public toastrService: ToastrService,
    private sqliteQueryService: SqliteQueryService,
    private electronService: ElectronService,
    private http: HttpClient,
  ) {
    super();
  }

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
            this.sqliteResult = result ? result[0] : null;
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

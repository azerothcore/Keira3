import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { distinctUntilChanged } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

import { MysqlService } from '../shared/services/mysql.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ElectronService } from '@keira-shared/services/electron.service';
import { KEIRA3_REPO_URL, LATEST_RELEASE_API_URL } from '@keira-constants/general';

@Component({
  selector: 'keira-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public readonly KEIRA3_REPO_URL = KEIRA3_REPO_URL;

  sqliteResult: { id: number; name: string };

  constructor(
    public mysqlService: MysqlService,
    public toastrService: ToastrService,
    private sqliteQueryService: SqliteQueryService,
    private electronService: ElectronService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.handleConnectionLostAlerts();
    this.handleSqliteTest();
    this.handleNewerVersionAlert();
  }

  private handleSqliteTest() {
    /* istanbul ignore next */
    if (this.electronService.isElectron()) {
      this.sqliteQueryService.query<{ id: number, name: string }>(
        'SELECT * FROM achievements WHERE id = 970', true
      ).subscribe((result) => {
        this.sqliteResult = result ? result[0] : null;
      });
    }
  }

  private handleConnectionLostAlerts() {
    this.mysqlService.connectionLost$
      .pipe(distinctUntilChanged())
      .subscribe((status) => {
        if (!status) {
          this.toastrService.error('Database connection lost');
        } else {
          this.toastrService.success('Database reconnected');
        }
      });
  }

  private handleNewerVersionAlert() {
    this.http.get<{ tag_name: string }>(LATEST_RELEASE_API_URL).subscribe(release => {
      console.log(release.tag_name);
    });
  }
}

import { Component, OnInit } from '@angular/core';

import { MysqlQueryService } from '../../shared/services/mysql-query.service';
import { VersionDbRow, VersionRow } from '@keira-types/general';
import packageInfo from '../../../../package.json';
import { AC_FORUM_URL, PAYPAL_DONATE_URL, KEIRA3_REPO_URL, AC_DISCORD_URL } from '@keira-constants/general';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';
import { ConfigService } from '@keira-shared/services/config.service';
import { MysqlService } from '@keira-shared/services/mysql.service';
import { SaveQueryService } from '@keira-shared/services/save-query.service';

@Component({
  selector: 'keira-home',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends SubscriptionHandler implements OnInit {
  coreVersions: VersionRow;
  dbWorldVersion: string;
  error = false;
  public readonly KEIRA_VERSION = packageInfo.version;
  public readonly PAYPAL_DONATE_URL = PAYPAL_DONATE_URL;
  public readonly AC_FORUM_URL = AC_FORUM_URL;
  public readonly AC_DISCORD_URL = AC_DISCORD_URL;
  public readonly KEIRA3_REPO_URL = KEIRA3_REPO_URL;
  public readonly NAVIGATOR_APP_VERSION = window.navigator.appVersion;

  get databaseName() {
    return this.mysqlService.config.database;
  }

  constructor(
    private queryService: MysqlQueryService,
    public configService: ConfigService,
    private readonly mysqlService: MysqlService,
    public saveQueryService: SaveQueryService,
  ) {
    super();
  }

  ngOnInit() {
    this.getCoreVersion();
    this.getWorldDbVersion();

    this.saveQueryService.setFilePath(process.cwd() + '\\changes.sql');
  }

  private getCoreVersion(): void {
    const query = 'SELECT * FROM version';

    this.subscriptions.push(
      this.queryService.query<VersionRow>(query).subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.coreVersions = data[0];

            if (!this.coreVersions.db_version.startsWith('ACDB') || !this.coreVersions.core_version.startsWith('AzerothCore')) {
              this.error = true;
            }
          } else {
            console.error(`Query ${query} produced no results: ${data}`);
          }
        },
        error: (error) => {
          this.error = true;
          console.error(error);
        },
      }),
    );
  }

  private getWorldDbVersion() {
    const query = 'SELECT * FROM version_db_world';
    this.subscriptions.push(
      this.queryService.query<VersionDbRow>(query).subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            const keys = Object.keys(data[0]);
            this.dbWorldVersion = keys[2];
          } else {
            console.error(`Query ${query} produced no results: ${data}`);
          }
        },
        error: (error) => {
          this.error = true;
          console.error(error);
        },
      }),
    );
  }

  getCommit(hash: string) {
    return `https://github.com/azerothcore/azerothcore-wotlk/commit/${hash}`;
  }
}

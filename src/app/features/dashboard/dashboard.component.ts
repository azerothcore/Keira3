import { Component, OnInit } from '@angular/core';

import { AC_DISCORD_URL, AC_FORUM_URL, KEIRA3_REPO_URL, PAYPAL_DONATE_URL } from '@keira-constants/general';
import { ConfigService } from '@keira-shared/services/config.service';
import { MysqlService } from '@keira-shared/services/mysql.service';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';
import { VersionRow } from '@keira-types/general';
import packageInfo from '../../../../package.json';
import { MysqlQueryService } from '../../shared/services/mysql-query.service';

@Component({
  selector: 'keira-home',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends SubscriptionHandler implements OnInit {
  coreVersions: VersionRow;
  dbWorldVersion: string;
  error = false;
  readonly KEIRA_VERSION = packageInfo.version;
  readonly PAYPAL_DONATE_URL = PAYPAL_DONATE_URL;
  readonly AC_FORUM_URL = AC_FORUM_URL;
  readonly AC_DISCORD_URL = AC_DISCORD_URL;
  readonly KEIRA3_REPO_URL = KEIRA3_REPO_URL;
  readonly NAVIGATOR_APP_VERSION = window.navigator.userAgent;

  get databaseName(): string {
    return this.mysqlService.config.database;
  }

  constructor(
    private readonly queryService: MysqlQueryService,
    public readonly configService: ConfigService,
    private readonly mysqlService: MysqlService,
  ) {
    super();
  }

  ngOnInit(): void {
    this.getCoreVersion();
    // this.getWorldDbVersion();
  }

  private getCoreVersion(): void {
    const query = 'SELECT * FROM version';

    this.subscriptions.push(
      this.queryService.query<VersionRow>(query).subscribe({
        next: (data) => {
          if (data && data.length > 0) {
            this.coreVersions = data[0];

            /* istanbul ignore next */
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

  // private getWorldDbVersion(): void {
  //   const query = 'SELECT * FROM version_db_world';
  //   this.subscriptions.push(
  //     this.queryService.query<VersionDbRow>(query).subscribe({
  //       next: (data) => {
  //         if (data && data.length > 0) {
  //           const keys = Object.keys(data[0]);
  //           this.dbWorldVersion = keys[2];
  //         } else {
  //           console.error(`Query ${query} produced no results: ${data}`);
  //         }
  //       },
  //       error: (error) => {
  //         this.error = true;
  //         console.error(error);
  //       },
  //     }),
  //   );
  // }

  getCommit(hash: string): string {
    return `https://github.com/azerothcore/azerothcore-wotlk/commit/${hash}`;
  }
}

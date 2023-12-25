import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { AC_DISCORD_URL, KEIRA3_REPO_URL, PAYPAL_DONATE_URL } from '@keira-constants/general';
import { ConfigService } from '@keira-shared/services/config.service';
import { MysqlService } from '@keira-shared/services/mysql.service';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';
import { VersionRow } from '@keira-types/general';
import packageInfo from '../../../../package.json';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
  selector: 'keira-home',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent extends SubscriptionHandler implements OnInit {
  protected coreVersions: VersionRow;
  protected commitUrl: string;
  protected dbWorldVersion: string;
  error = false;
  protected readonly KEIRA_VERSION = packageInfo.version;
  protected readonly PAYPAL_DONATE_URL = PAYPAL_DONATE_URL;
  protected readonly AC_DISCORD_URL = AC_DISCORD_URL;
  protected readonly KEIRA3_REPO_URL = KEIRA3_REPO_URL;
  protected readonly NAVIGATOR_APP_VERSION = window.navigator.userAgent;

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
            this.commitUrl = this.getCommitUrl(this.coreVersions.core_revision);

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

  private getCommitUrl(hash: string): string {
    // if the hash ends with "+", remove it from the link
    if (hash.substring(hash.length - 1, hash.length) === '+') {
      hash = hash.substring(0, hash.length - 1);
    }

    return `https://github.com/azerothcore/azerothcore-wotlk/commit/${hash}`;
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
}

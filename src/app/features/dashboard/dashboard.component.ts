import { Component, OnInit } from '@angular/core';

import { MysqlQueryService } from '../../shared/services/mysql-query.service';
import { VersionDbRow, VersionRow } from '@keira-types/general';
import { version } from '../../../../package.json';
import { AC_FORUM_URL, PAYPAL_DONATE_URL, KEIRA3_REPO_URL, AC_DISCORD_URL } from '@keira-constants/general';
import { SubscriptionHandler } from '@keira-shared/utils/subscription-handler/subscription-handler';
import { ConfigService } from '@keira-shared/services/config.service';

@Component({
  selector: 'keira-home',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends SubscriptionHandler implements OnInit {

  coreVersions: VersionRow;
  dbWorldVersion: string;
  public readonly KEIRA_VERSION = version;
  public readonly PAYPAL_DONATE_URL = PAYPAL_DONATE_URL;
  public readonly AC_FORUM_URL = AC_FORUM_URL;
  public readonly AC_DISCORD_URL = AC_DISCORD_URL;
  public readonly KEIRA3_REPO_URL = KEIRA3_REPO_URL;

  constructor(
    private queryService: MysqlQueryService,
    public configService: ConfigService,
  ) {
    super();
  }

  ngOnInit() {
    this.getCoreVersion();
    this.getWorldDbVersion();
  }

  private getCoreVersion(): void {
    const query = 'SELECT * FROM version';

    this.subscriptions.push(
      this.queryService.query<VersionRow>(query).subscribe((data) => {
        if (data && data.length > 0) {
          this.coreVersions = data[0];
        } else {
          console.error(`Query ${query} produced no results: ${data}`);
        }
      }, (error) => {
        console.error(error);
      })
    );
  }

  private getWorldDbVersion() {
    const query = 'SELECT * FROM version_db_world';
    this.subscriptions.push(
      this.queryService.query<VersionDbRow>(query).subscribe((data) => {
        if (data && data.length > 0) {
          const keys = Object.keys(data[0]);
          this.dbWorldVersion = keys[2];
        } else {
          console.error(`Query ${query} produced no results: ${data}`);
        }
      }, (error) => {
        console.error(error);
      })
    );
  }

  getCommit(hash: string) {
    return `https://github.com/azerothcore/azerothcore-wotlk/commit/${hash}`;
  }
}

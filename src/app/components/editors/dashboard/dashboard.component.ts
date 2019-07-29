import { Component, OnInit } from '@angular/core';

import { QueryService } from '../../../services/query.service';
import { VersionDbRow, VersionRow } from '../../../types/general';
import { version } from '../../../../../package.json';
import { AC_FORUM_URL, PAYPAL_DONATE_URL, KEIRA3_REPO_URL, AC_DISCORD_URL } from '../../../constants/general';
import { SubscriptionHandler } from '../../../utils/subscription-handler/subscription-handler';
import { ConfigService } from '../../../services/config.service';

@Component({
  selector: 'app-home',
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
    private queryService: QueryService,
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
        if (data && data.results && data.results.length > 0) {
          this.coreVersions = data.results[0];
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
        if (data && data.results && data.results.length > 0) {
          const keys = Object.keys(data.results[0]);
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

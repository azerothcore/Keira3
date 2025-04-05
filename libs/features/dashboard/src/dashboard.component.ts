import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';

import { AC_DISCORD_URL, KEIRA3_REPO_URL, PAYPAL_DONATE_URL, VersionRow } from '@keira/shared/constants';
// eslint-disable-next-line @nx/enforce-module-boundaries
import packageInfo from '../../../../package.json';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';

import { TranslateModule } from '@ngx-translate/core';
import { SubscriptionHandler } from '@keira/shared/utils';
import { MysqlQueryService, MysqlService } from '@keira/shared/db-layer';
import { ConfigService } from '@keira/shared/common-services';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-home',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  imports: [TranslateModule, ClipboardModule, FormsModule],
})
export class DashboardComponent extends SubscriptionHandler implements OnInit {
  protected coreVersions!: VersionRow;
  protected commitUrl!: string;
  protected dbWorldVersion!: string;
  protected wrongEmuWarning = false;
  protected readonly KEIRA_VERSION = packageInfo.version;
  protected readonly PAYPAL_DONATE_URL = PAYPAL_DONATE_URL;
  protected readonly AC_DISCORD_URL = AC_DISCORD_URL;
  protected readonly KEIRA3_REPO_URL = KEIRA3_REPO_URL;
  protected readonly NAVIGATOR_APP_VERSION = window.navigator.userAgent;

  private readonly queryService = inject(MysqlQueryService);
  protected readonly configService = inject(ConfigService);
  private readonly mysqlService = inject(MysqlService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  get databaseName(): string {
    return this.mysqlService.config.database as string;
  }

  ngOnInit(): void {
    this.reload();
  }

  protected reload(): void {
    this.wrongEmuWarning = false;
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
              this.wrongEmuWarning = true;
            }

            this.changeDetectorRef.markForCheck();
          } else {
            console.error(`Query ${query} produced no results: ${data}`);
          }
        },
        error: (error) => {
          this.wrongEmuWarning = true;
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

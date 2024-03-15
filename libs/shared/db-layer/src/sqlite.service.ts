import { Inject, Injectable, NgZone } from '@angular/core';

import { KEIRA_APP_CONFIG_TOKEN, KeiraAppConfig } from '@keira/shared/config';
import { TableRow } from '@keira/shared/constants';
import { Observable } from 'rxjs';
import { ElectronService } from '@keira/shared/common-services';

/* istanbul ignore next */ // Note: will be tested in e2e
@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  private db;

  constructor(
    private electronService: ElectronService,
    private ngZone: NgZone,
    @Inject(KEIRA_APP_CONFIG_TOKEN) private KEIRA_APP_CONFIG: KeiraAppConfig,
  ) {
    /* istanbul ignore next */
    if (this.electronService.isElectron()) {
      const sqlite = window.require('sqlite3');
      this.db = new sqlite.Database(KEIRA_APP_CONFIG.sqlitePath, sqlite.OPEN_READONLY, (error) => {
        if (error) {
          console.log(`Error when opening sqlite database at ${KEIRA_APP_CONFIG.sqlitePath}`);
          console.error(error);
        }
      });
    }
  }

  dbQuery<T extends TableRow>(queryString: string): Observable<T[]> {
    return new Observable<T[]>((subscriber) => {
      if (this.db) {
        this.db.all(queryString, this.getQueryCallback(subscriber));
        /* istanbul ignore else */
      } /* istanbul ignore next */ else if (this.electronService.isElectron()) {
        console.error(`sqite db was not defined when trying to run query: ${queryString}`);
      }
    });
  }

  private getQueryCallback<T extends TableRow>(subscriber) {
    return (err: Error | null, results: T) => {
      this.ngZone.run(() => {
        if (err) {
          console.log(`Error when executing sqlite query: \n\n`);
          console.error(err);
          subscriber.error(err);
        } else {
          subscriber.next(results);
        }
        subscriber.complete();
      });
    };
  }
}

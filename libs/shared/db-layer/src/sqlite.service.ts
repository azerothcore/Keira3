import { Injectable, NgZone, inject } from '@angular/core';

import { ElectronService } from '@keira/shared/common-services';
import { KEIRA_APP_CONFIG_TOKEN, KeiraAppConfig } from '@keira/shared/config';
import { TableRow } from '@keira/shared/constants';
import { Observable, Subscriber } from 'rxjs';

/* istanbul ignore next */ // Note: will be tested in e2e
@Injectable({
  providedIn: 'root',
})
export class SqliteService {
  private electronService = inject(ElectronService);
  private ngZone = inject(NgZone);

  private readonly db;

  constructor() {
    const KEIRA_APP_CONFIG = inject<KeiraAppConfig>(KEIRA_APP_CONFIG_TOKEN);

    /* istanbul ignore next */
    if (this.electronService.isElectron()) {
      const sqlite = window.require('sqlite3');
      this.db = new sqlite.Database(KEIRA_APP_CONFIG.sqlitePath, sqlite.OPEN_READONLY, (error: unknown) => {
        if (error) {
          console.info(`Error when opening sqlite database at ${KEIRA_APP_CONFIG.sqlitePath}`);
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

  private getQueryCallback<T extends TableRow>(subscriber: Subscriber<T[]>) {
    return (err: Error | null, results: T[]) => {
      this.ngZone.run(() => {
        if (err) {
          console.info(`Error when executing sqlite query: \n\n`);
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

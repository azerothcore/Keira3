import { Injectable, NgZone } from '@angular/core';
import { Database, OPEN_READONLY } from 'sqlite3';
import { Observable } from 'rxjs';
import { AppConfig } from '../../../environments/environment';
import { ElectronService } from '@keira-shared/services/electron.service';
import { TableRow } from '@keira-types/general';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  private db: Database;

  constructor(
    private electronService: ElectronService,
    private ngZone: NgZone,
  ) {
    /* istanbul ignore next */
    if (this.electronService.isElectron()) {
      this.db = new Database(AppConfig.sqlitePath, OPEN_READONLY, (error) => {
        if (error) {
          console.log(`Error when opening sqlite database at ${AppConfig.sqlitePath}`);
          console.error(error);
        }
      });
    }
  }

  dbQuery<T extends TableRow>(queryString: string): Observable<T> {
    return new Observable<T>(subscriber => {
      if (this.db) {
        this.db.get(queryString, this.getQueryCallback(subscriber));
      } else {
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

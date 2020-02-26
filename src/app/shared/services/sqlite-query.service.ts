import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { SqliteService } from '@keira-shared/services/sqlite.service';
import { ConfigService } from '@keira-shared/services/config.service';
import { TableRow } from '@keira-types/general';

@Injectable({
  providedIn: 'root'
})
export class SqliteQueryService {

  constructor(
    private sqliteService: SqliteService,
    private configService: ConfigService,
  ) { }

  query<T extends TableRow>(queryString: string): Observable<T> {
    return this.sqliteService.dbQuery<T>(queryString).pipe(
      tap(val => {
        if (this.configService.debugMode) {
          console.log(`\n${queryString}`);
          console.log(val);
        }
      })
    );
  }
}

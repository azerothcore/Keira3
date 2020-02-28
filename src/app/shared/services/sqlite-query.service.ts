import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { SqliteService } from '@keira-shared/services/sqlite.service';
import { ConfigService } from '@keira-shared/services/config.service';
import { MysqlResult, TableRow, ValueRow } from '@keira-types/general';

@Injectable({
  providedIn: 'root'
})
export class SqliteQueryService {

  constructor(
    private sqliteService: SqliteService,
    private configService: ConfigService,
  ) { }

  /* istanbul ignore next */ // Note: will be tested in e2e
  query<T extends TableRow>(queryString: string, silent = false): Observable<T> {
    return this.sqliteService.dbQuery<T>(queryString).pipe(
      tap(val => {
        if (this.configService.debugMode && !silent) {
          console.log(`\n${queryString}`);
          console.log(val);
        }
      })
    );
  }

  // Input query format must be: SELECT something AS v FROM ...
  queryValue<T extends string | number>(query: string): Observable<T | null> {
    return this.query(query).pipe(
      map((data) => data ? data.v as T : null),
    );
  }

  getDisplayIdIcon(displayId: string | number): Observable<string> {
    return this.queryValue(`SELECT icon AS v FROM display_icons WHERE displayId = ${displayId}`);
  }

  getSpellNameById(id: string | number): Promise<string> {
    return this.queryValue<string>(`SELECT spellName AS v FROM spells WHERE id = ${id}`).toPromise();
  }
}

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

import { SqliteService } from '@keira-shared/services/sqlite.service';
import { ConfigService } from '@keira-shared/services/config.service';
import { TableRow } from '@keira-types/general';
import { QueryService } from '@keira-shared/services/query.service';

@Injectable({
  providedIn: 'root'
})
export class SqliteQueryService extends QueryService {

  private itemDisplayIdCache: Observable<string>[] = [];
  private spellNameCache: Promise<string>[] = [];

  constructor(
    private sqliteService: SqliteService,
    private configService: ConfigService,
  ) {
    super();
  }

  /* istanbul ignore next */ // Note: will be tested in e2e
  query<T extends TableRow>(queryString: string, silent = false): Observable<T[]> {
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
      map((data) => data && data[0] ? data[0].v as T : null),
    );
  }

  getIconByItemDisplayId(displayId: string | number): Observable<string> {
    displayId = Number(displayId);

    if (!this.itemDisplayIdCache[displayId]) {
      this.itemDisplayIdCache[displayId] = this.queryValue<string>(
        `SELECT icon AS v FROM display_icons WHERE displayId = ${displayId}`
      ).pipe(shareReplay());
    }

    return this.itemDisplayIdCache[displayId];
  }

  getSpellNameById(spellId: string | number): Promise<string> {
    spellId = Number(spellId);

    if (!this.spellNameCache[spellId]) {
      this.spellNameCache[spellId] = this.queryValue<string>(
        `SELECT spellName AS v FROM spells WHERE id = ${spellId}`
      ).pipe(shareReplay()).toPromise();
    }

    return this.spellNameCache[spellId];
  }
}

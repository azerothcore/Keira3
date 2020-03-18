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
  queryValue<T extends string | number>(query: string): Promise<T | null> {
    return this.query(query).pipe(
      map((data) => data ? data.v as T : null),
    ).toPromise();
  }

  getDisplayIdIcon(displayId: string | number): Promise<string> {
    return this.queryValue<string>(`SELECT icon AS v FROM display_icons WHERE displayId = ${displayId}`);
  }

  getSkillNameById(skillId: string | number): Promise<string> {
    return this.queryValue<string>(`SELECT name AS v FROM skills WHERE id = ${skillId} LIMIT 1`);
  }

  getSpellNameById(id: string | number): Promise<string> {
    return this.queryValue<string>(`SELECT spellName AS v FROM spells WHERE id = ${id}`);
  }

  getFactionNameById(id: string | number): Promise<string> {
    return this.queryValue<string>(`SELECT m_name_lang_1 AS v FROM factions WHERE m_ID = ${id}`);
  }

  // TODO: getLock
  // getLockById(id: string | number): Promise<string> {
  //   return this.queryValue<string>(`SELECT * FROM lock WHERE id = ${id}`);
  // }

  getMapNameById(id: string | number): Promise<string> {
    return this.queryValue<string>(`SELECT m_MapName_lang1 AS v FROM maps WHERE m_ID = ${id}`);
  }

  getAreaNameById(id: string | number): Promise<string> {
    return this.queryValue<string>(`SELECT m_AreaName_lang AS v FROM areas_and_zones WHERE m_ID = ${id}`);
  }
}

import { Injectable } from '@angular/core';

import { map, mergeMap, Observable, of } from 'rxjs';
import { SqliteQueryService } from '@keira/shared/core';
import { MysqlQueryService } from '@keira/shared/core';

export const TRADE_ENGINEERING_ICON_ID = 1;

@Injectable({
  providedIn: 'root',
})
export class IconService {
  constructor(
    private sqliteQueryService: SqliteQueryService,
    private mysqlQueryService: MysqlQueryService,
  ) {}

  getIconByItemDisplayId(displayId: string | number): Observable<string> {
    return this.sqliteQueryService.getIconByItemDisplayId(displayId).pipe(map((icon) => icon?.replace('.tga', '')));
  }

  getIconByItemId(itemId: string | number): Observable<string> {
    return this.mysqlQueryService
      .getDisplayIdByItemId(itemId)
      .pipe(mergeMap((displayId) => (!!displayId ? this.getIconByItemDisplayId(displayId) : of(null))));
  }

  getIconBySpellId(spellId: string | number): Observable<string> {
    return this.sqliteQueryService
      .getDisplayIdBySpellId(spellId)
      .pipe(mergeMap((displayId) => this.sqliteQueryService.getIconBySpellDisplayId(!!displayId ? displayId : TRADE_ENGINEERING_ICON_ID)));
  }
}

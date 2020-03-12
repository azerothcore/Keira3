import { Injectable } from '@angular/core';
import { mergeMap } from 'rxjs/operators';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ItemIconService {

  constructor(
    private sqliteQueryService: SqliteQueryService,
    private mysqlQueryService: MysqlQueryService,
  ) {}

  getIconByItemDisplayId(displayId: string | number): Observable<string> {
    return this.sqliteQueryService.getIconByItemDisplayId(displayId);
  }

  getIconByItemId(itemId: string | number): Observable<string> {
    return this.mysqlQueryService.getDisplayIdByItemId(itemId).pipe(
      mergeMap(displayId => this.getIconByItemDisplayId(displayId)),
    );
  }
}

import { Injectable } from '@angular/core';
import { fromPromise } from 'rxjs/internal-compatibility';
import { map } from 'rxjs/operators';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ItemTemplate } from '@keira-types/item-template.type';

@Injectable({
  providedIn: 'root'
})
export class ItemIconService {

  constructor(
    private sqliteQueryService: SqliteQueryService,
    private mysqlQueryService: MysqlQueryService,
  ) {}

  async addIconLinkToRows(rows: ItemTemplate[]) {
    for (const row of rows) {
      row.iconLink = String(await this.getIconLinkByDisplayId(row.displayid, 'medium'));
    }
  }

  getIconLinkByDisplayId(displayId: string | number, size: 'large' | 'medium' | 'small'): Promise<string> {
    return fromPromise(this.sqliteQueryService.getDisplayIdIcon(displayId)).pipe(
      map(icon => `https://wow.zamimg.com/images/wow/icons/${size}/${icon}.jpg`),
    ).toPromise();
  }
}

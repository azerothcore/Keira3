import { Injectable } from '@angular/core';
import { fromPromise } from 'rxjs/internal-compatibility';
import { map, mergeMap } from 'rxjs/operators';

import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ItemTemplate } from '@keira-types/item-template.type';
import { LootTemplate } from '@keira-types/loot-template.type';
import { TableRow } from '@keira-types/general';

@Injectable({
  providedIn: 'root'
})
export class ItemIconService {

  constructor(
    private sqliteQueryService: SqliteQueryService,
    private mysqlQueryService: MysqlQueryService,
  ) {}

  // TODO: use this to reuse code
  // async addIconLinkToRows(rows: TableRow[], property: string) {
  //   for (const row of rows) {
  //     row.iconLink = String(await this.getIconLinkByDisplayId(row[property], 'medium'));
  //   }
  // }

  async addIconLinkToRowsByDisplayId(rows: ItemTemplate[]) {
    for (const row of rows) {
      row.iconLink = String(await this.getIconLinkByDisplayId(row.displayid, 'medium'));
    }
  }

  getIconLinkByDisplayId(displayId: string | number, size: 'large' | 'medium' | 'small'): Promise<string> {
    return fromPromise(this.sqliteQueryService.getDisplayIdIcon(displayId)).pipe(
      map(icon => `https://wow.zamimg.com/images/wow/icons/${size}/${icon}.jpg`),
    ).toPromise();
  }

  async addIconLinkToRowsById(rows: LootTemplate[]) {
    for (const row of rows) {
      row.iconLink = String(await this.getIconLinkById(row.Item, 'medium'));
      console.log(row.iconLink);
    }
  }

  getIconLinkById(id: string | number, size: 'large' | 'medium' | 'small'): Promise<string> {
    return fromPromise(this.mysqlQueryService.getItemDisplayIdById(id)).pipe(
      mergeMap(displayId => fromPromise(this.getIconLinkByDisplayId(displayId, size))),
    ).toPromise();
  }
}

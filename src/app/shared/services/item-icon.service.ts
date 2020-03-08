import { Injectable } from '@angular/core';
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
      row.iconLink = String(await this.sqliteQueryService.getIconLinkByDisplayId(row.displayid, 'medium'));
    }
  }
}

import { Injectable, inject } from '@angular/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { ITEM_TEMPLATE_SEARCH_FIELDS, ITEM_TEMPLATE_TABLE, ItemTemplate } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class ItemSearchService extends SearchService<ItemTemplate> {
  override readonly queryService = inject(MysqlQueryService);
  protected override readonly entityTable = ITEM_TEMPLATE_TABLE;
  protected override readonly fieldList = ITEM_TEMPLATE_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}

import { Injectable, inject } from '@angular/core';

import { ITEM_EXTENDED_COST_SEARCH_FIELDS, ITEM_EXTENDED_COST_TABLE, ItemExtendedCost } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class ItemExtendedCostSearchService extends SearchService<ItemExtendedCost> {
  protected override queryService = inject(SqliteQueryService);
  protected override readonly entityTable = ITEM_EXTENDED_COST_TABLE;
  protected override readonly fieldList = ITEM_EXTENDED_COST_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}

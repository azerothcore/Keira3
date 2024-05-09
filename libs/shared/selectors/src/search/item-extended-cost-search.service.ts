import { Injectable } from '@angular/core';

import { ITEM_EXTENDED_COST_SEARCH_FIELDS, ITEM_EXTENDED_COST_TABLE, ItemExtendedCost } from '@keira/shared/acore-world-model';
import { SqliteSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class ItemExtendedCostSearchService extends SqliteSearchService<ItemExtendedCost> {
  protected readonly entityTable = ITEM_EXTENDED_COST_TABLE;
  protected readonly fieldList = ITEM_EXTENDED_COST_SEARCH_FIELDS;
}

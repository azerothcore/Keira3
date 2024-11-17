import { Injectable } from '@angular/core';

import { ITEM_EXTENDED_COST_SEARCH_FIELDS, ITEM_EXTENDED_COST_TABLE, ItemExtendedCost } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class ItemExtendedCostSearchService extends SearchService<ItemExtendedCost> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override queryService: SqliteQueryService) {
    super(queryService, ITEM_EXTENDED_COST_TABLE, ITEM_EXTENDED_COST_SEARCH_FIELDS);
  }
}

import { Injectable } from '@angular/core';

import { SearchService } from './search.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ITEM_EXTENDED_COST_SEARCH_FIELDS, ITEM_EXTENDED_COST_TABLE, ItemExtendedCost } from '../../types/item-extended-cost.type';

@Injectable({
  providedIn: 'root',
})
export class ItemExtendedCostSearchService extends SearchService<ItemExtendedCost> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, ITEM_EXTENDED_COST_TABLE, ITEM_EXTENDED_COST_SEARCH_FIELDS);
  }
}

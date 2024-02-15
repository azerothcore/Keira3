import { Injectable } from '@angular/core';
import { SqliteQueryService } from '@keira-shared/services/query/sqlite-query.service';
import { ItemExtendedCost, ITEM_EXTENDED_COST_SEARCH_FIELDS, ITEM_EXTENDED_COST_TABLE } from '../../types/item-extended-cost.type';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class ItemExtendedCostSearchService extends SearchService<ItemExtendedCost> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, ITEM_EXTENDED_COST_TABLE, ITEM_EXTENDED_COST_SEARCH_FIELDS);
  }
}

import { Injectable } from '@angular/core';

import { ITEM_LIMIT_CATEGORY_SEARCH_FIELDS, ITEM_LIMIT_CATEGORY_TABLE, ItemLimitCategory } from '@keira/acore-world-model';
import { SearchService } from './search.service';
import { SqliteQueryService } from '../../services/query/sqlite-query.service';

@Injectable({
  providedIn: 'root',
})
export class ItemLimitCategorySearchService extends SearchService<ItemLimitCategory> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, ITEM_LIMIT_CATEGORY_TABLE, ITEM_LIMIT_CATEGORY_SEARCH_FIELDS);
  }
}

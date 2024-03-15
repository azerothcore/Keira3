import { Injectable } from '@angular/core';

import { ITEM_LIMIT_CATEGORY_SEARCH_FIELDS, ITEM_LIMIT_CATEGORY_TABLE, ItemLimitCategory } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/core';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class ItemLimitCategorySearchService extends SearchService<ItemLimitCategory> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, ITEM_LIMIT_CATEGORY_TABLE, ITEM_LIMIT_CATEGORY_SEARCH_FIELDS);
  }
}

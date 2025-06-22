import { Injectable, inject } from '@angular/core';

import { ITEM_LIMIT_CATEGORY_SEARCH_FIELDS, ITEM_LIMIT_CATEGORY_TABLE, ItemLimitCategory } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class ItemLimitCategorySearchService extends SearchService<ItemLimitCategory> {
  protected override queryService: SqliteQueryService;

  constructor() {
    const queryService = inject(SqliteQueryService);

    super(queryService, ITEM_LIMIT_CATEGORY_TABLE, ITEM_LIMIT_CATEGORY_SEARCH_FIELDS);

    this.queryService = queryService;
  }
}

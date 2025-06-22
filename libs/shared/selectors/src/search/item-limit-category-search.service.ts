import { Injectable, inject } from '@angular/core';

import { ITEM_LIMIT_CATEGORY_SEARCH_FIELDS, ITEM_LIMIT_CATEGORY_TABLE, ItemLimitCategory } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class ItemLimitCategorySearchService extends SearchService<ItemLimitCategory> {
  protected override queryService = inject(SqliteQueryService);
  protected readonly entityTable = ITEM_LIMIT_CATEGORY_TABLE;
  protected readonly fieldList = ITEM_LIMIT_CATEGORY_SEARCH_FIELDS;
  private readonly init = this.init();
}

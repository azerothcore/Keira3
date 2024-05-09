import { Injectable } from '@angular/core';

import { ITEM_LIMIT_CATEGORY_SEARCH_FIELDS, ITEM_LIMIT_CATEGORY_TABLE, ItemLimitCategory } from '@keira/shared/acore-world-model';
import { SqliteSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class ItemLimitCategorySearchService extends SqliteSearchService<ItemLimitCategory> {
  protected readonly entityTable = ITEM_LIMIT_CATEGORY_TABLE;
  protected readonly fieldList = ITEM_LIMIT_CATEGORY_SEARCH_FIELDS;
}

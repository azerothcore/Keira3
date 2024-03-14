import { Injectable } from '@angular/core';

import { ITEM_ENCHANTMENT_SEARCH_FIELDS, ITEM_ENCHANTMENT_TABLE, ItemEnchantment } from '@keira/shared/acore-world-model';
import { SearchService } from './search.service';
import { SqliteQueryService } from '@keira/shared/core';

@Injectable({
  providedIn: 'root',
})
export class ItemEnchantmentSearchService extends SearchService<ItemEnchantment> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, ITEM_ENCHANTMENT_TABLE, ITEM_ENCHANTMENT_SEARCH_FIELDS);
  }
}

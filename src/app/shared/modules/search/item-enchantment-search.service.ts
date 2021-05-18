import { Injectable } from '@angular/core';

import { SearchService } from './search.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import {
  ITEM_ENCHANTMENT_SEARCH_FIELDS,
  ITEM_ENCHANTMENT_TABLE,
  ItemEnchantment,
} from '../../types/item-enchantment.type';

@Injectable({
  providedIn: 'root',
})
export class ItemEnchantmentSearchService extends SearchService<ItemEnchantment> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, ITEM_ENCHANTMENT_TABLE, ITEM_ENCHANTMENT_SEARCH_FIELDS);
  }
}

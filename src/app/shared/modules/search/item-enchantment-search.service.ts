import { Injectable } from '@angular/core';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { ItemEnchantment, ITEM_ENCHANTMENT_SEARCH_FIELDS, ITEM_ENCHANTMENT_TABLE } from '../../types/item-enchantment.type';
import { SearchService } from './search.service';

@Injectable({
  providedIn: 'root',
})
export class ItemEnchantmentSearchService extends SearchService<ItemEnchantment> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected queryService: SqliteQueryService) {
    super(queryService, ITEM_ENCHANTMENT_TABLE, ITEM_ENCHANTMENT_SEARCH_FIELDS);
  }
}

import { Injectable } from '@angular/core';

import { ITEM_ENCHANTMENT_SEARCH_FIELDS, ITEM_ENCHANTMENT_TABLE, ItemEnchantment } from '@keira/shared/acore-world-model';
import { SqliteSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class ItemEnchantmentSearchService extends SqliteSearchService<ItemEnchantment> {
  protected readonly entityTable = ITEM_ENCHANTMENT_TABLE;
  protected readonly fieldList = ITEM_ENCHANTMENT_SEARCH_FIELDS;
}

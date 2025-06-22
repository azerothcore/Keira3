import { Injectable, inject } from '@angular/core';

import { ITEM_ENCHANTMENT_SEARCH_FIELDS, ITEM_ENCHANTMENT_TABLE, ItemEnchantment } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { SqliteQueryService } from '@keira/shared/db-layer';

@Injectable({
  providedIn: 'root',
})
export class ItemEnchantmentSearchService extends SearchService<ItemEnchantment> {
  protected override queryService = inject(SqliteQueryService);
  protected readonly entityTable = ITEM_ENCHANTMENT_TABLE;
  protected readonly fieldList = ITEM_ENCHANTMENT_SEARCH_FIELDS;
  private readonly init = this.init();
}

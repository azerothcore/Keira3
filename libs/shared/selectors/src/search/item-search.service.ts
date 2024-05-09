import { Injectable } from '@angular/core';
import { ITEM_TEMPLATE_SEARCH_FIELDS, ITEM_TEMPLATE_TABLE, ItemTemplate } from '@keira/shared/acore-world-model';
import { MysqlSearchService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class ItemSearchService extends MysqlSearchService<ItemTemplate> {
  protected readonly entityTable = ITEM_TEMPLATE_TABLE;
  protected readonly fieldList = ITEM_TEMPLATE_SEARCH_FIELDS;
}

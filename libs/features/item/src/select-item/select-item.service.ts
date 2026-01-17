import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import {
  ITEM_TEMPLATE_ID,
  ITEM_TEMPLATE_NAME,
  ITEM_TEMPLATE_SEARCH_FIELDS,
  ITEM_TEMPLATE_TABLE,
  ItemTemplate,
} from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectItemService extends SelectService<ItemTemplate> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(ItemHandlerService);
  protected override readonly entityTable = ITEM_TEMPLATE_TABLE;
  protected override readonly entityIdField = ITEM_TEMPLATE_ID;
  protected override entityNameField = ITEM_TEMPLATE_NAME;
  protected override readonly fieldList = ITEM_TEMPLATE_SEARCH_FIELDS;
  constructor() {
    super();
    this.init();
  }
}

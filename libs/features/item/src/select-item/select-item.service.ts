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
  override readonly queryService: MysqlQueryService;
  override readonly handlerService: ItemHandlerService;

  constructor() {
    const queryService = inject(MysqlQueryService);
    const handlerService = inject(ItemHandlerService);

    super(queryService, handlerService, ITEM_TEMPLATE_TABLE, ITEM_TEMPLATE_ID, ITEM_TEMPLATE_NAME, ITEM_TEMPLATE_SEARCH_FIELDS);

    this.queryService = queryService;
    this.handlerService = handlerService;
  }
}

import { Injectable } from '@angular/core';
import { MysqlQueryService, SelectService } from '@keira/shared/core';
import {
  ITEM_TEMPLATE_ID,
  ITEM_TEMPLATE_NAME,
  ITEM_TEMPLATE_SEARCH_FIELDS,
  ITEM_TEMPLATE_TABLE,
  ItemTemplate,
} from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';

@Injectable()
export class SelectItemService extends SelectService<ItemTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    readonly queryService: MysqlQueryService,
    public handlerService: ItemHandlerService,
  ) {
    super(queryService, handlerService, ITEM_TEMPLATE_TABLE, ITEM_TEMPLATE_ID, ITEM_TEMPLATE_NAME, ITEM_TEMPLATE_SEARCH_FIELDS);
  }
}

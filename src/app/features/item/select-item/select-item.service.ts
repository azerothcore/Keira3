import { Injectable } from '@angular/core';

import { SelectService } from '@keira-abstract/service/select/select.service';
import {
  ITEM_TEMPLATE_ID,
  ITEM_TEMPLATE_NAME, ITEM_TEMPLATE_SEARCH_FIELDS,
  ITEM_TEMPLATE_TABLE,
  ItemTemplate
} from '@keira-types/item-template.type';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import { ItemHandlerService } from '../item-handler.service';

@Injectable()
export class SelectItemService extends SelectService<ItemTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: MysqlQueryService,
    public handlerService: ItemHandlerService,
  ) {
    super(
      queryService,
      handlerService,
      ITEM_TEMPLATE_TABLE,
      ITEM_TEMPLATE_ID,
      ITEM_TEMPLATE_NAME,
      ITEM_TEMPLATE_SEARCH_FIELDS,
    );
  }
}

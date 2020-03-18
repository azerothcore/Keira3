import { Injectable } from '@angular/core';

import { SelectService } from '@keira-abstract/service/select/select.service';
import {
  ITEM_TEMPLATE_ID,
  ITEM_TEMPLATE_NAME, ITEM_TEMPLATE_SEARCH_FIELDS,
  ITEM_TEMPLATE_TABLE,
  ItemTemplate
} from '@keira-types/item-template.type';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { ItemHandlerService } from '../item-handler.service';
import { SqliteQueryService } from '@keira-shared/services/sqlite-query.service';
import { IconService } from '@keira-shared/modules/icon/icon.service';

@Injectable()
export class SelectItemService extends SelectService<ItemTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: MysqlQueryService,
    public handlerService: ItemHandlerService,
    private itemIconService: IconService,
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

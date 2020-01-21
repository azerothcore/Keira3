import { Injectable } from '@angular/core';

import { SelectService } from '../../../shared/abstract/service/select/select.service';
import {
  ITEM_TEMPLATE_ID,
  ITEM_TEMPLATE_NAME, ITEM_TEMPLATE_SEARCH_FIELDS,
  ITEM_TEMPLATE_TABLE,
  ItemTemplate
} from '../../../shared/types/item-template.type';
import { QueryService } from '../../../shared/services/query.service';
import { ItemHandlerService } from '../item-handler.service';

@Injectable({
  providedIn: 'root'
})
export class SelectItemService extends SelectService<ItemTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: QueryService,
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

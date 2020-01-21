import { Component, } from '@angular/core';

import { SelectComponent } from '@keira-shared/abstract/components/editors/select.component';
import {
  ITEM_TEMPLATE_CUSTOM_STARTING_ID,
  ITEM_TEMPLATE_ID,
  ITEM_TEMPLATE_TABLE,
  ItemTemplate
} from '@keira-types/item-template.type';
import { SelectItemService } from './select-item.service';
import { ItemHandlerService } from '../item-handler.service';
import { QueryService } from '@keira-shared/services/query.service';

@Component({
  selector: 'app-select-item',
  templateUrl: './select-item.component.html',
  styleUrls: ['./select-item.component.scss']
})
export class SelectItemComponent extends SelectComponent<ItemTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectItemService,
    public handlerService: ItemHandlerService,
    public queryService: QueryService,
  ) {
    super(
      ITEM_TEMPLATE_TABLE,
      ITEM_TEMPLATE_ID,
      ITEM_TEMPLATE_CUSTOM_STARTING_ID,
      selectService,
      handlerService,
      queryService,
    );
  }
}

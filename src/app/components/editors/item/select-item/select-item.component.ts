import { Component, } from '@angular/core';

import { SelectComponent } from '../../shared/select.component';
import {
  ITEM_TEMPLATE_CUSTOM_STARTING_ID,
  ITEM_TEMPLATE_ID,
  ITEM_TEMPLATE_TABLE,
  ItemTemplate
} from '../../../../types/item-template.type';
import { ItemSelectService } from '../../../../services/select/item-select.service';
import { ItemHandlerService } from '../../../../services/handlers/item-handler.service';
import { QueryService } from '../../../../services/query.service';

@Component({
  selector: 'app-select-item',
  templateUrl: './select-item.component.html',
  styleUrls: ['./select-item.component.scss']
})
export class SelectItemComponent extends SelectComponent<ItemTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: ItemSelectService,
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

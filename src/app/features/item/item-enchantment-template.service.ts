import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { QueryService } from '@keira-shared/services/query.service';
import {
  ITEM_ENCHANTMENT_TEMPLATE_ID, ITEM_ENCHANTMENT_TEMPLATE_ID_2,
  ITEM_ENCHANTMENT_TEMPLATE_TABLE,
  ItemEnchantmentTemplate
} from '@keira-types/item-enchantment-template.type';
import { ItemHandlerService } from './item-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ItemEnchantmentTemplateService extends MultiRowEditorService<ItemEnchantmentTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      ItemEnchantmentTemplate,
      ITEM_ENCHANTMENT_TEMPLATE_TABLE,
      ITEM_ENCHANTMENT_TEMPLATE_ID,
      ITEM_ENCHANTMENT_TEMPLATE_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

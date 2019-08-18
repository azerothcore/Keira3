import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { QueryService } from '../../query.service';
import {
  ITEM_ENCHANTMENT_TEMPLATE_ID, ITEM_ENCHANTMENT_TEMPLATE_ID_2,
  ITEM_ENCHANTMENT_TEMPLATE_TABLE,
  ItemEnchantmentTemplate
} from '../../../types/item-enchantment-template.type';
import { ItemHandlerService } from '../../handlers/item-handler.service';

@Injectable({
  providedIn: 'root'
})
export class ItemEnchantmentTemplateService extends MultiRowEditorService<ItemEnchantmentTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      ItemEnchantmentTemplate,
      ITEM_ENCHANTMENT_TEMPLATE_TABLE,
      ITEM_ENCHANTMENT_TEMPLATE_ID,
      ITEM_ENCHANTMENT_TEMPLATE_ID_2,
      handlerService,
      queryService,
    );
  }
}

import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  ITEM_ENCHANTMENT_TEMPLATE_ID,
  ITEM_ENCHANTMENT_TEMPLATE_ID_2,
  ITEM_ENCHANTMENT_TEMPLATE_TABLE,
  ItemEnchantmentTemplate,
} from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ItemEnchantmentTemplateService extends MultiRowEditorService<ItemEnchantmentTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected handlerService: ItemHandlerService) {
    super(
      ItemEnchantmentTemplate,
      ITEM_ENCHANTMENT_TEMPLATE_TABLE,
      ITEM_ENCHANTMENT_TEMPLATE_ID,
      ITEM_ENCHANTMENT_TEMPLATE_ID_2,
      handlerService,
    );
  }
}

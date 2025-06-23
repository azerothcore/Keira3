import { Injectable, inject } from '@angular/core';
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
  protected override readonly handlerService = inject(ItemHandlerService);
  protected override readonly _entityClass = ItemEnchantmentTemplate;
  protected override readonly _entityTable = ITEM_ENCHANTMENT_TEMPLATE_TABLE;
  protected override readonly _entityIdField = ITEM_ENCHANTMENT_TEMPLATE_ID;
  protected override readonly _entitySecondIdField = ITEM_ENCHANTMENT_TEMPLATE_ID_2;

  constructor() {
    super();
    this.init();
  }
}

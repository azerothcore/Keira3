import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import {
  DISENCHANT_LOOT_TEMPLATE_TABLE,
  ITEM_ENCHANTMENT_TEMPLATE_TABLE,
  ITEM_LOOT_TEMPLATE_TABLE,
  ITEM_TEMPLATE_TABLE,
  ItemTemplate,
  MILLING_LOOT_TEMPLATE_TABLE,
  PROSPECTING_LOOT_TEMPLATE_TABLE,
} from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class ItemHandlerService extends HandlerService<ItemTemplate> {
  protected readonly mainEditorRoutePath = 'item/item-template';

  get isItemTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[ITEM_TEMPLATE_TABLE].asReadonly();
  }

  get isItemEnchantmentUnsaved(): Signal<boolean> {
    return this.statusMap[ITEM_ENCHANTMENT_TEMPLATE_TABLE].asReadonly();
  }

  get isItemLootTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[ITEM_LOOT_TEMPLATE_TABLE].asReadonly();
  }

  get isDisenchantmentLootTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[DISENCHANT_LOOT_TEMPLATE_TABLE].asReadonly();
  }

  get isProspectingLootTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[PROSPECTING_LOOT_TEMPLATE_TABLE].asReadonly();
  }

  get isMillingLootTemplateUnsaved(): Signal<boolean> {
    return this.statusMap[MILLING_LOOT_TEMPLATE_TABLE].asReadonly();
  }

  protected _statusMap = {
    [ITEM_TEMPLATE_TABLE]: signal(false),
    [ITEM_ENCHANTMENT_TEMPLATE_TABLE]: signal(false),
    [ITEM_LOOT_TEMPLATE_TABLE]: signal(false),
    [DISENCHANT_LOOT_TEMPLATE_TABLE]: signal(false),
    [PROSPECTING_LOOT_TEMPLATE_TABLE]: signal(false),
    [MILLING_LOOT_TEMPLATE_TABLE]: signal(false),
  };
}

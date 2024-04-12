import { Injectable } from '@angular/core';
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

  get isItemTemplateUnsaved(): boolean {
    return this.statusMap[ITEM_TEMPLATE_TABLE];
  }
  get isItemEnchantmentUnsaved(): boolean {
    return this.statusMap[ITEM_ENCHANTMENT_TEMPLATE_TABLE];
  }
  get isItemLootTemplateUnsaved(): boolean {
    return this.statusMap[ITEM_LOOT_TEMPLATE_TABLE];
  }
  get isDisenchantmentLootTemplateUnsaved(): boolean {
    return this.statusMap[DISENCHANT_LOOT_TEMPLATE_TABLE];
  }
  get isProspectingLootTemplateUnsaved(): boolean {
    return this.statusMap[PROSPECTING_LOOT_TEMPLATE_TABLE];
  }
  get isMillingLootTemplateUnsaved(): boolean {
    return this.statusMap[MILLING_LOOT_TEMPLATE_TABLE];
  }

  protected _statusMap = {
    [ITEM_TEMPLATE_TABLE]: false,
    [ITEM_ENCHANTMENT_TEMPLATE_TABLE]: false,
    [ITEM_LOOT_TEMPLATE_TABLE]: false,
    [DISENCHANT_LOOT_TEMPLATE_TABLE]: false,
    [PROSPECTING_LOOT_TEMPLATE_TABLE]: false,
    [MILLING_LOOT_TEMPLATE_TABLE]: false,
  };
}

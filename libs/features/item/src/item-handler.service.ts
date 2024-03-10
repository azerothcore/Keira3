import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HandlerService } from '@keira/shared/core';
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

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected router: Router) {
    super('item/item-template', router);
  }
}

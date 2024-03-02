import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HandlerService } from '@keira-abstract/service/handlers/handler.service';
import { DISENCHANT_LOOT_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { ITEM_ENCHANTMENT_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { ITEM_LOOT_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { ItemTemplate, ITEM_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { MILLING_LOOT_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { PROSPECTING_LOOT_TEMPLATE_TABLE } from '@keira/acore-world-model';

@Injectable()
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

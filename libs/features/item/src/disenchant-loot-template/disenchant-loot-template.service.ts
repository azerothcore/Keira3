import { Injectable, inject } from '@angular/core';
import { LootEditorIdService } from '@keira/shared/base-abstract-classes';
import {
  DISENCHANT_LOOT_TEMPLATE_TABLE,
  DISENCHANT_TEMPLATE_LOOT_ID,
  DisenchantLootTemplate,
  ITEM_TEMPLATE_ID,
  ITEM_TEMPLATE_TABLE,
} from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';

@Injectable({
  providedIn: 'root',
})
export class DisenchantLootTemplateService extends LootEditorIdService<DisenchantLootTemplate> {
  protected override readonly handlerService: ItemHandlerService;

  constructor() {
    const handlerService = inject(ItemHandlerService);

    super(
      DisenchantLootTemplate,
      DISENCHANT_LOOT_TEMPLATE_TABLE,
      ITEM_TEMPLATE_TABLE,
      ITEM_TEMPLATE_ID,
      DISENCHANT_TEMPLATE_LOOT_ID,
      handlerService,
    );

    this.handlerService = handlerService;
  }
}

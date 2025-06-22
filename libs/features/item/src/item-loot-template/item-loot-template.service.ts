import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { ITEM_LOOT_TEMPLATE_TABLE, ItemLootTemplate, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '@keira/shared/acore-world-model';
import { ItemHandlerService } from '../item-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ItemLootTemplateService extends MultiRowEditorService<ItemLootTemplate> {
  protected override readonly handlerService: ItemHandlerService;

  constructor() {
    const handlerService = inject(ItemHandlerService);

    super(ItemLootTemplate, ITEM_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, handlerService);

    this.handlerService = handlerService;
  }
}

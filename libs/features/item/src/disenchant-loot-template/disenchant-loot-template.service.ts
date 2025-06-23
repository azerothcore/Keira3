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
  protected override readonly handlerService = inject(ItemHandlerService);
  protected override _entityClass = DisenchantLootTemplate;
  protected override _entityTable = DISENCHANT_LOOT_TEMPLATE_TABLE;
  protected override _entityTemplateTable = ITEM_TEMPLATE_TABLE;
  protected override _entityTemplateIdField = ITEM_TEMPLATE_ID;
  protected override _entityTemplateLootField = DISENCHANT_TEMPLATE_LOOT_ID;

  constructor() {
    super();
    this.init();
  }
}

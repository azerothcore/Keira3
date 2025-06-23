import { Injectable, inject } from '@angular/core';
import { LootEditorIdService } from '@keira/shared/base-abstract-classes';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_SKINNING_LOOT_ID,
  CREATURE_TEMPLATE_TABLE,
  CreatureLootTemplate,
  SKINNING_LOOT_TEMPLATE_TABLE,
  SkinningLootTemplate,
} from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SkinningLootTemplateService extends LootEditorIdService<SkinningLootTemplate> {
  protected override readonly handlerService = inject(CreatureHandlerService);

  protected override _entityClass = CreatureLootTemplate;
  protected override _entityTable = SKINNING_LOOT_TEMPLATE_TABLE;
  protected override _entityTemplateTable = CREATURE_TEMPLATE_TABLE;
  protected override _entityTemplateIdField = CREATURE_TEMPLATE_ID;
  protected override _entityTemplateLootField = CREATURE_TEMPLATE_SKINNING_LOOT_ID;

  constructor() {
    super();
    this.init();
  }
}

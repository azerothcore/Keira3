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
  protected override readonly handlerService: CreatureHandlerService;

  constructor() {
    const handlerService = inject(CreatureHandlerService);

    super(
      CreatureLootTemplate,
      SKINNING_LOOT_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_SKINNING_LOOT_ID,
      handlerService,
    );

    this.handlerService = handlerService;
  }
}

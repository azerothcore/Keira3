import { Injectable, inject } from '@angular/core';
import { LootEditorIdService } from '@keira/shared/base-abstract-classes';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_PICKPOCKETING_LOOT_ID,
  CREATURE_TEMPLATE_TABLE,
  CreatureLootTemplate,
  PICKPOCKETING_LOOT_TEMPLATE_TABLE,
  PickpocketingLootTemplate,
} from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class PickpocketingLootTemplateService extends LootEditorIdService<PickpocketingLootTemplate> {
  protected override readonly handlerService = inject(CreatureHandlerService);

  constructor() {
    super(
      CreatureLootTemplate,
      PICKPOCKETING_LOOT_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_PICKPOCKETING_LOOT_ID,
    );
  }
}

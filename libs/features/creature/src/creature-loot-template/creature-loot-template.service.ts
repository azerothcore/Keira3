import { Injectable, inject } from '@angular/core';
import { LootEditorIdService } from '@keira/shared/base-abstract-classes';
import {
  CREATURE_LOOT_TEMPLATE_TABLE,
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_LOOT_ID,
  CREATURE_TEMPLATE_TABLE,
  CreatureLootTemplate,
} from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureLootTemplateService extends LootEditorIdService<CreatureLootTemplate> {
  protected override readonly handlerService: CreatureHandlerService;

  constructor() {
    const handlerService = inject(CreatureHandlerService);

    super(
      CreatureLootTemplate,
      CREATURE_LOOT_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_LOOT_ID,
      handlerService,
    );

    this.handlerService = handlerService;
  }
}

import { Injectable } from '@angular/core';

import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import {
  PICKPOCKETING_LOOT_TEMPLATE_TABLE,
  PickpocketingLootTemplate
} from '../../../types/pickpocketing-loot-template.type';
import { LootEditorService } from '../loot-editor.service';
import { CreatureLootTemplate } from '../../../types/creature-loot-template.type';
import {
  CREATURE_TEMPLATE_ID, CREATURE_TEMPLATE_PICKPOCKETING_LOOT_ID,
  CREATURE_TEMPLATE_TABLE
} from '../../../types/creature-template.type';

@Injectable({
  providedIn: 'root'
})
export class PickpocketingLootTemplateService extends LootEditorService<PickpocketingLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      CreatureLootTemplate,
      PICKPOCKETING_LOOT_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_PICKPOCKETING_LOOT_ID,
      handlerService,
      queryService,
    );
  }
}

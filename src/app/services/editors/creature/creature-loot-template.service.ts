import { Injectable } from '@angular/core';

import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import {
  CREATURE_LOOT_TEMPLATE_TABLE,
  CreatureLootTemplate,
} from '../../../components/editors/creature/creature-loot-template/creature-loot-template.type';
import { LootEditorService } from '../loot-editor.service';
import {
  CREATURE_TEMPLATE_ID, CREATURE_TEMPLATE_LOOT_ID,
  CREATURE_TEMPLATE_TABLE
} from '../../../components/editors/creature/creature-template/creature-template.type';

@Injectable({
  providedIn: 'root'
})
export class CreatureLootTemplateService extends LootEditorService<CreatureLootTemplate> {

  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      CreatureLootTemplate,
      CREATURE_LOOT_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_LOOT_ID,
      handlerService,
      queryService,
    );
  }
}

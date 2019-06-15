import { Injectable } from '@angular/core';

import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import {
  SKINNING_LOOT_TEMPLATE_TABLE,
  SkinningLootTemplate
} from '../../../components/editors/creature/skinning-loot-template/skinning-loot-template.type';
import { LootEditorService } from '../loot-editor.service';
import {
    CreatureLootTemplate
} from '../../../components/editors/creature/creature-loot-template/creature-loot-template.type';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_SKINNING_LOOT_ID,
  CREATURE_TEMPLATE_TABLE
} from '../../../components/editors/creature/creature-template/creature-template.type';

@Injectable({
  providedIn: 'root'
})
export class SkinningLootTemplateService extends LootEditorService<SkinningLootTemplate> {

  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      CreatureLootTemplate,
      SKINNING_LOOT_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_SKINNING_LOOT_ID,
      handlerService,
      queryService,
    );
  }
}

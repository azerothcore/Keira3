import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import {
  CREATURE_LOOT_TEMPLATE_ID,
  CREATURE_LOOT_TEMPLATE_ID_2,
  CREATURE_LOOT_TEMPLATE_TABLE,
  CreatureLootTemplate,
} from '../../../components/editors/creature/creature-loot-template/creature-loot-template.type';

@Injectable({
  providedIn: 'root'
})
export class CreatureLootTemplateService extends MultiRowEditorService<CreatureLootTemplate> {

  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      CreatureLootTemplate,
      CREATURE_LOOT_TEMPLATE_TABLE,
      CREATURE_LOOT_TEMPLATE_ID,
      CREATURE_LOOT_TEMPLATE_ID_2,
      handlerService,
      queryService,
    );
  }
}

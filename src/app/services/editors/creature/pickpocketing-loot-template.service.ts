import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import {
  PICKPOCKETING_LOOT_TEMPLATE_ID,
  PICKPOCKETING_LOOT_TEMPLATE_ID_2,
  PICKPOCKETING_LOOT_TEMPLATE_TABLE,
  PickpocketingLootTemplate,
} from '../../../components/editors/creature/pickpocketing-loot-template/pickpocketing-loot-template.type';

@Injectable({
  providedIn: 'root'
})
export class PickpocketingLootTemplateService extends MultiRowEditorService<PickpocketingLootTemplate> {

  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      PickpocketingLootTemplate,
      PICKPOCKETING_LOOT_TEMPLATE_TABLE,
      PICKPOCKETING_LOOT_TEMPLATE_ID,
      PICKPOCKETING_LOOT_TEMPLATE_ID_2,
      handlerService,
      queryService,
    );
  }
}

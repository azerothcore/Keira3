import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import {
  SKINNING_LOOT_TEMPLATE_ID,
  SKINNING_LOOT_TEMPLATE_ID_2,
  SKINNING_LOOT_TEMPLATE_TABLE,
  SkinningLootTemplate
} from '../../../components/editors/creature/skinning-loot-template/skinning-loot-template.type';

@Injectable({
  providedIn: 'root'
})
export class SkinningLootTemplateService extends MultiRowEditorService<SkinningLootTemplate> {

  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      SkinningLootTemplate,
      SKINNING_LOOT_TEMPLATE_TABLE,
      SKINNING_LOOT_TEMPLATE_ID,
      SKINNING_LOOT_TEMPLATE_ID_2,
      handlerService,
      queryService,
    );
  }
}

import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CreatureHandlerService } from '../creature-handler.service';
import { QueryService } from '../../../shared/services/query.service';
import {
  PICKPOCKETING_LOOT_TEMPLATE_TABLE,
  PickpocketingLootTemplate
} from '../../../shared/types/pickpocketing-loot-template.type';
import { LootEditorService } from '../../../shared/abstract/service/editors/loot-editor.service';
import { CreatureLootTemplate } from '../../../shared/types/creature-loot-template.type';
import {
  CREATURE_TEMPLATE_ID, CREATURE_TEMPLATE_PICKPOCKETING_LOOT_ID,
  CREATURE_TEMPLATE_TABLE
} from '../../../shared/types/creature-template.type';

@Injectable({
  providedIn: 'root'
})
export class PickpocketingLootTemplateService extends LootEditorService<PickpocketingLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureLootTemplate,
      PICKPOCKETING_LOOT_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_PICKPOCKETING_LOOT_ID,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

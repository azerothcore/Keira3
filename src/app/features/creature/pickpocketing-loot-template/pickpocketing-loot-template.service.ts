import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CreatureHandlerService } from '../creature-handler.service';
import { QueryService } from '@keira-shared/services/query.service';
import {
  PICKPOCKETING_LOOT_TEMPLATE_TABLE,
  PickpocketingLootTemplate
} from '@keira-types/pickpocketing-loot-template.type';
import { LootEditorService } from '@keira-abstract/service/editors/loot-editor.service';
import { CreatureLootTemplate } from '@keira-types/creature-loot-template.type';
import {
  CREATURE_TEMPLATE_ID, CREATURE_TEMPLATE_PICKPOCKETING_LOOT_ID,
  CREATURE_TEMPLATE_TABLE
} from '@keira-types/creature-template.type';

@Injectable()
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

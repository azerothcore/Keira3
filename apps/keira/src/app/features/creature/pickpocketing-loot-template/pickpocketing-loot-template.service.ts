import { Injectable } from '@angular/core';
import { LootEditorIdService, MysqlQueryService } from '@keira/shared/core';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_PICKPOCKETING_LOOT_ID,
  CREATURE_TEMPLATE_TABLE,
  CreatureLootTemplate,
  PICKPOCKETING_LOOT_TEMPLATE_TABLE,
  PickpocketingLootTemplate,
} from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class PickpocketingLootTemplateService extends LootEditorIdService<PickpocketingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    readonly queryService: MysqlQueryService,
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

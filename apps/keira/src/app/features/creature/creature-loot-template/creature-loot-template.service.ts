import { Injectable } from '@angular/core';
import { LootEditorIdService, MysqlQueryService } from '@keira/shared/core';
import {
  CREATURE_LOOT_TEMPLATE_TABLE,
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_LOOT_ID,
  CREATURE_TEMPLATE_TABLE,
  CreatureLootTemplate,
} from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable()
export class CreatureLootTemplateService extends LootEditorIdService<CreatureLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureLootTemplate,
      CREATURE_LOOT_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_LOOT_ID,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

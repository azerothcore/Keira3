import { Injectable } from '@angular/core';
import { LootEditorIdService } from '@keira-abstract/service/editors/loot-editor-id.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { CreatureLootTemplate } from '@keira-types/creature-loot-template.type';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_PICKPOCKETING_LOOT_ID,
  CREATURE_TEMPLATE_TABLE,
} from '@keira-types/creature-template.type';
import { PickpocketingLootTemplate, PICKPOCKETING_LOOT_TEMPLATE_TABLE } from '@keira-types/pickpocketing-loot-template.type';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaveQueryService } from '@keira-shared/services/save-query.service';

@Injectable()
export class PickpocketingLootTemplateService extends LootEditorIdService<PickpocketingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    public readonly queryService: MysqlQueryService,
    public readonly saveQueryService: SaveQueryService,
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
      saveQueryService,
      toastrService,
    );
  }
}

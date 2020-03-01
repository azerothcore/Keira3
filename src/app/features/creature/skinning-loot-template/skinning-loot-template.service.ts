import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CreatureHandlerService } from '../creature-handler.service';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import {
  SKINNING_LOOT_TEMPLATE_TABLE,
  SkinningLootTemplate
} from '@keira-types/skinning-loot-template.type';
import { LootEditorService } from '@keira-abstract/service/editors/loot-editor.service';
import {
    CreatureLootTemplate
} from '@keira-types/creature-loot-template.type';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_SKINNING_LOOT_ID,
  CREATURE_TEMPLATE_TABLE
} from '@keira-types/creature-template.type';

@Injectable()
export class SkinningLootTemplateService extends LootEditorService<SkinningLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureLootTemplate,
      SKINNING_LOOT_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_SKINNING_LOOT_ID,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

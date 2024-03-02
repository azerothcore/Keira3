import { Injectable } from '@angular/core';
import { LootEditorIdService } from '@keira-abstract/service/editors/loot-editor-id.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { CreatureLootTemplate } from '@keira/acore-world-model';
import { CREATURE_TEMPLATE_ID, CREATURE_TEMPLATE_SKINNING_LOOT_ID, CREATURE_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { SkinningLootTemplate, SKINNING_LOOT_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable()
export class SkinningLootTemplateService extends LootEditorIdService<SkinningLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    readonly queryService: MysqlQueryService,
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

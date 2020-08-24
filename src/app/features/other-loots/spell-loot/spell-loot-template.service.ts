import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SPELL_LOOT_TEMPLATE_TABLE, SpellLootTemplate } from '@keira-types/spell-loot-template.type';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '@keira-types/loot-template.type';
import { SpellLootHandlerService } from './spell-loot-handler.service';

@Injectable()
export class SpellLootTemplateService extends MultiRowEditorService<SpellLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: SpellLootHandlerService,
    public readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      SpellLootTemplate,
      SPELL_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      LOOT_TEMPLATE_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

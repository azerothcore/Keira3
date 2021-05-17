import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CreatureHandlerService } from '../creature-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  CREATURE_TEMPLATE_SPELL_ID,
  CREATURE_TEMPLATE_SPELL_TABLE,
  CREATURE_TEMPLATE_SPELL_ID_2,
  CreatureTemplateSpell,
} from '@keira-types/creature-template-spell.type';
import { MultiRowEditorService } from '@keira-shared/abstract/service/editors/multi-row-editor.service';

@Injectable()
export class CreatureTemplateSpellService extends MultiRowEditorService<CreatureTemplateSpell> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    public readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureTemplateSpell,
      CREATURE_TEMPLATE_SPELL_TABLE,
      CREATURE_TEMPLATE_SPELL_ID,
      CREATURE_TEMPLATE_SPELL_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

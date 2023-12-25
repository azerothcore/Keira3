import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-shared/abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import {
  CreatureTemplateSpell,
  CREATURE_TEMPLATE_SPELL_ID,
  CREATURE_TEMPLATE_SPELL_ID_2,
  CREATURE_TEMPLATE_SPELL_TABLE,
} from '@keira-types/creature-template-spell.type';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable()
export class CreatureTemplateSpellService extends MultiRowEditorService<CreatureTemplateSpell> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    readonly queryService: MysqlQueryService,
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

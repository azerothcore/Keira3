import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CreatureHandlerService } from '../creature-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  CREATURE_TEMPLATE_RESISTANCE_ID,
  CREATURE_TEMPLATE_RESISTANCE_TABLE, CREATURE_TEMPLATE_RESISTANCE_ID_2,
  CreatureTemplateResistance
} from '@keira-types/creature-template-resistance.type';
import { MultiRowEditorService } from '@keira-shared/abstract/service/editors/multi-row-editor.service';

@Injectable()
export class CreatureTemplateResistanceService extends MultiRowEditorService<CreatureTemplateResistance> {

  FIRST_ROW_START_VALUE = 1;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    public readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureTemplateResistance,
      CREATURE_TEMPLATE_RESISTANCE_TABLE,
      CREATURE_TEMPLATE_RESISTANCE_ID,
      CREATURE_TEMPLATE_RESISTANCE_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

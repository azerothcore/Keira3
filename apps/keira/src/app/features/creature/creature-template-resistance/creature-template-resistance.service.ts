import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-shared/abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import {
  CreatureTemplateResistance,
  CREATURE_TEMPLATE_RESISTANCE_ID,
  CREATURE_TEMPLATE_RESISTANCE_ID_2,
  CREATURE_TEMPLATE_RESISTANCE_TABLE,
} from '@keira-types/creature-template-resistance.type';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable()
export class CreatureTemplateResistanceService extends MultiRowEditorService<CreatureTemplateResistance> {
  FIRST_ROW_START_VALUE = 1;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    readonly queryService: MysqlQueryService,
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

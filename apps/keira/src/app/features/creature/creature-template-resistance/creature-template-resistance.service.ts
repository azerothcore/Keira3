import { Injectable } from '@angular/core';
import { MultiRowEditorService, MysqlQueryService } from '@keira/shared/core';
import {
  CREATURE_TEMPLATE_RESISTANCE_ID,
  CREATURE_TEMPLATE_RESISTANCE_ID_2,
  CREATURE_TEMPLATE_RESISTANCE_TABLE,
  CreatureTemplateResistance,
} from '@keira/shared/acore-world-model';
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

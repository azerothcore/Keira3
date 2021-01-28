import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CreatureHandlerService } from '../creature-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import {
  CREATURE_TEMPLATE_RESISTANCE_ID,
  CREATURE_TEMPLATE_RESISTANCE_TABLE, CREATURE_TEMPLATE_SCHOOL,
  CreatureTemplateResistance
} from '@keira-types/creature-template-resistance.type';

@Injectable()
export class CreatureTemplateResistanceService extends SingleRowEditorService<CreatureTemplateResistance> {

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
	  CREATURE_TEMPLATE_SCHOOL,
      false,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

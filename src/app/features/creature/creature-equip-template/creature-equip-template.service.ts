import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import { CreatureHandlerService } from '../creature-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  CREATURE_EQUIP_TEMPLATE_ID, CREATURE_EQUIP_TEMPLATE_TABLE,
  CreatureEquipTemplate
} from '@keira-types/creature-equip-template.type';

@Injectable()
export class CreatureEquipTemplateService extends SingleRowEditorService<CreatureEquipTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureEquipTemplate,
      CREATURE_EQUIP_TEMPLATE_TABLE,
      CREATURE_EQUIP_TEMPLATE_ID,
      null,
      false,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

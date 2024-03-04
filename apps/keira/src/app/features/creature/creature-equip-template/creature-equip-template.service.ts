import { Injectable } from '@angular/core';
import { MysqlQueryService, SingleRowEditorService } from '@keira/core';
import { CREATURE_EQUIP_TEMPLATE_ID, CREATURE_EQUIP_TEMPLATE_TABLE, CreatureEquipTemplate } from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable()
export class CreatureEquipTemplateService extends SingleRowEditorService<CreatureEquipTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    readonly queryService: MysqlQueryService,
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

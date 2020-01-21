import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SingleRowEditorService } from '../../../shared/abstract/service/editors/single-row-editor.service';
import { CreatureHandlerService } from '../creature-handler.service';
import { QueryService } from '../../../shared/services/query.service';
import {
  CREATURE_EQUIP_TEMPLATE_ID, CREATURE_EQUIP_TEMPLATE_TABLE,
  CreatureEquipTemplate
} from '../../../shared/types/creature-equip-template.type';

@Injectable({
  providedIn: 'root'
})
export class CreatureEquipTemplateService extends SingleRowEditorService<CreatureEquipTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
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

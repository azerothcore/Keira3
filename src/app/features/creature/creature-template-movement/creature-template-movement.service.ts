import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { CreatureHandlerService } from '../creature-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import {
  CREATURE_TEMPLATE_MOVEMENT_ID,
  CREATURE_TEMPLATE_MOVEMENT_TABLE,
  CreatureTemplateMovement,
} from '@keira-types/creature-template-movement.type';

@Injectable()
export class CreatureTemplateMovementService extends SingleRowEditorService<CreatureTemplateMovement> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    public readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureTemplateMovement,
      CREATURE_TEMPLATE_MOVEMENT_TABLE,
      CREATURE_TEMPLATE_MOVEMENT_ID,
      null,
      false,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

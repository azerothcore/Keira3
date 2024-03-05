import { Injectable } from '@angular/core';
import { MysqlQueryService, SingleRowEditorService } from '@keira/shared/core';
import { CREATURE_TEMPLATE_MOVEMENT_ID, CREATURE_TEMPLATE_MOVEMENT_TABLE, CreatureTemplateMovement } from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable()
export class CreatureTemplateMovementService extends SingleRowEditorService<CreatureTemplateMovement> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    readonly queryService: MysqlQueryService,
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

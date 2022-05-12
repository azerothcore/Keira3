import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  CreatureTemplateMovement,
  CREATURE_TEMPLATE_MOVEMENT_ID,
  CREATURE_TEMPLATE_MOVEMENT_TABLE,
} from '@keira-types/creature-template-movement.type';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaveQueryService } from '@keira-shared/services/save-query.service';

@Injectable()
export class CreatureTemplateMovementService extends SingleRowEditorService<CreatureTemplateMovement> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    public readonly queryService: MysqlQueryService,
    public readonly saveQueryService: SaveQueryService,
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
      saveQueryService,
      toastrService,
    );
  }
}

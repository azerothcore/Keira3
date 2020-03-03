import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_NAME, CREATURE_TEMPLATE_TABLE,
  CreatureTemplate
} from '@keira-types/creature-template.type';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable()
export class CreatureTemplateService extends SingleRowEditorService<CreatureTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureTemplate,
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_NAME,
      true,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

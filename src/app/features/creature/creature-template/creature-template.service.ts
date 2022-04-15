import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  CreatureTemplate,
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_NAME,
  CREATURE_TEMPLATE_TABLE,
} from '@keira-types/creature-template.type';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable()
export class CreatureTemplateService extends SingleRowEditorService<CreatureTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    public readonly queryService: MysqlQueryService,
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

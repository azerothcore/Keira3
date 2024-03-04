import { Injectable } from '@angular/core';
import { MysqlQueryService, SingleRowEditorService } from '@keira/core';
import { CREATURE_TEMPLATE_ID, CREATURE_TEMPLATE_NAME, CREATURE_TEMPLATE_TABLE, CreatureTemplate } from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable()
export class CreatureTemplateService extends SingleRowEditorService<CreatureTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    readonly queryService: MysqlQueryService,
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

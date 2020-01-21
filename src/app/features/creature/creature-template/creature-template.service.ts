import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { SingleRowEditorService } from '@keira-shared/abstract/service/editors/single-row-editor.service';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_NAME, CREATURE_TEMPLATE_TABLE,
  CreatureTemplate
} from '@keira-types/creature-template.type';
import { QueryService } from '@keira-shared/services/query.service';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root'
})
export class CreatureTemplateService extends SingleRowEditorService<CreatureTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
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

import { Injectable } from '@angular/core';

import { SingleRowEditorService } from '../single-row-editor.service';
import {
  CREATURE_TEMPLATE_ID,
  CREATURE_TEMPLATE_NAME, CREATURE_TEMPLATE_TABLE,
  CreatureTemplate
} from '../../../types/creature-template.type';
import { QueryService } from '../../query.service';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';

@Injectable({
  providedIn: 'root'
})
export class CreatureTemplateService extends SingleRowEditorService<CreatureTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      CreatureTemplate,
      CREATURE_TEMPLATE_TABLE,
      CREATURE_TEMPLATE_ID,
      CREATURE_TEMPLATE_NAME,
      true,
      handlerService,
      queryService,
    );
  }
}

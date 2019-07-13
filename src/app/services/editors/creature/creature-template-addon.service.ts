import { Injectable } from '@angular/core';

import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import { SingleRowEditorService } from '../single-row-editor.service';
import {
  CREATURE_TEMPLATE_ADDON_ID, CREATURE_TEMPLATE_ADDON_TABLE,
  CreatureTemplateAddon
} from '../../../types/creature-template-addon.type';

@Injectable({
  providedIn: 'root'
})
export class CreatureTemplateAddonService extends SingleRowEditorService<CreatureTemplateAddon> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      CreatureTemplateAddon,
      CREATURE_TEMPLATE_ADDON_TABLE,
      CREATURE_TEMPLATE_ADDON_ID,
      null,
      false,
      handlerService,
      queryService,
    );
  }
}

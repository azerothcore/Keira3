import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { QueryService } from '../../query.service';
import { PROSPECTING_LOOT_TEMPLATE_TABLE, ProspectingLootTemplate } from '../../../types/prospecting-loot-template.type';
import { ItemHandlerService } from '../../handlers/item-handler.service';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '../../../components/editors/shared/loot-template/loot-template.type';

@Injectable({
  providedIn: 'root'
})
export class ProspectingLootTemplateService extends MultiRowEditorService<ProspectingLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      ProspectingLootTemplate,
      PROSPECTING_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      LOOT_TEMPLATE_ID_2,
      handlerService,
      queryService,
    );
  }
}

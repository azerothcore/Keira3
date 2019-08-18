import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { QueryService } from '../../query.service';
import { MILLING_LOOT_TEMPLATE_TABLE, MillingLootTemplate } from '../../../types/milling-loot-template.type';
import { ItemHandlerService } from '../../handlers/item-handler.service';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '../../../components/editors/shared/loot-template/loot-template.type';

@Injectable({
  providedIn: 'root'
})
export class MillingLootTemplateService extends MultiRowEditorService<MillingLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      MillingLootTemplate,
      MILLING_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      LOOT_TEMPLATE_ID_2,
      handlerService,
      queryService,
    );
  }
}

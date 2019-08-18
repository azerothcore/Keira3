import { Injectable } from '@angular/core';

import { ItemHandlerService } from '../../handlers/item-handler.service';
import { QueryService } from '../../query.service';
import {
  DISENCHANT_LOOT_TEMPLATE_TABLE,
  DisenchantLootTemplate,
} from '../../../types/disenchant-loot-template.type';
import { LootEditorService } from '../loot-editor.service';
import { DISENCHANT_TEMPLATE_LOOT_ID, ITEM_TEMPLATE_ID, ITEM_TEMPLATE_TABLE } from '../../../types/item-template.type';

@Injectable({
  providedIn: 'root'
})
export class DisenchantLootTemplateService extends LootEditorService<DisenchantLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      DisenchantLootTemplate,
      DISENCHANT_LOOT_TEMPLATE_TABLE,
      ITEM_TEMPLATE_TABLE,
      ITEM_TEMPLATE_ID,
      DISENCHANT_TEMPLATE_LOOT_ID,
      handlerService,
      queryService,
    );
  }
}

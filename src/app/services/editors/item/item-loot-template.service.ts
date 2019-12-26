import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { QueryService } from '../../query.service';
import { ITEM_LOOT_TEMPLATE_TABLE, ItemLootTemplate } from '../../../types/item-loot-template.type';
import { ItemHandlerService } from '../../handlers/item-handler.service';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '../../../components/editors/shared/loot-template/loot-template.type';

@Injectable({
  providedIn: 'root'
})
export class ItemLootTemplateService extends MultiRowEditorService<ItemLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      ItemLootTemplate,
      ITEM_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      LOOT_TEMPLATE_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

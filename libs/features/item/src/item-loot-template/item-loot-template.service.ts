import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { ITEM_LOOT_TEMPLATE_TABLE, ItemLootTemplate, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { ItemHandlerService } from '../item-handler.service';

@Injectable({
  providedIn: 'root',
})
export class ItemLootTemplateService extends MultiRowEditorService<ItemLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(ItemLootTemplate, ITEM_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, handlerService, queryService, toastrService);
  }
}

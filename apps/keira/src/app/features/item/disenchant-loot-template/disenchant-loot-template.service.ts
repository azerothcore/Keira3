import { Injectable } from '@angular/core';
import { LootEditorIdService, MysqlQueryService } from '@keira/core';
import {
  DISENCHANT_LOOT_TEMPLATE_TABLE,
  DISENCHANT_TEMPLATE_LOOT_ID,
  DisenchantLootTemplate,
  ITEM_TEMPLATE_ID,
  ITEM_TEMPLATE_TABLE,
} from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { ItemHandlerService } from '../item-handler.service';

@Injectable()
export class DisenchantLootTemplateService extends LootEditorIdService<DisenchantLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      DisenchantLootTemplate,
      DISENCHANT_LOOT_TEMPLATE_TABLE,
      ITEM_TEMPLATE_TABLE,
      ITEM_TEMPLATE_ID,
      DISENCHANT_TEMPLATE_LOOT_ID,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

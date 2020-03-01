import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { ItemHandlerService } from '../item-handler.service';
import { MysqlQueryService } from '../../../shared/services/mysql-query.service';
import {
  DISENCHANT_LOOT_TEMPLATE_TABLE,
  DisenchantLootTemplate,
} from '@keira-types/disenchant-loot-template.type';
import { LootEditorService } from '@keira-abstract/service/editors/loot-editor.service';
import { DISENCHANT_TEMPLATE_LOOT_ID, ITEM_TEMPLATE_ID, ITEM_TEMPLATE_TABLE } from '@keira-types/item-template.type';

@Injectable()
export class DisenchantLootTemplateService extends LootEditorService<DisenchantLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    protected queryService: MysqlQueryService,
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

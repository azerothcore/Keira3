import { Injectable } from '@angular/core';
import { MultiRowEditorService, MysqlQueryService } from '@keira/shared/core';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, MILLING_LOOT_TEMPLATE_TABLE, MillingLootTemplate } from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { ItemHandlerService } from '../item-handler.service';

@Injectable({
  providedIn: 'root',
})
export class MillingLootTemplateService extends MultiRowEditorService<MillingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      MillingLootTemplate,
      MILLING_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      LOOT_TEMPLATE_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '../../shared/abstract/service/editors/multi-row-editor.service';
import { QueryService } from '../../shared/services/query.service';
import { MILLING_LOOT_TEMPLATE_TABLE, MillingLootTemplate } from '../../shared/types/milling-loot-template.type';
import { ItemHandlerService } from './item-handler.service';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '../../shared/types/loot-template.type';

@Injectable({
  providedIn: 'root'
})
export class MillingLootTemplateService extends MultiRowEditorService<MillingLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    protected queryService: QueryService,
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

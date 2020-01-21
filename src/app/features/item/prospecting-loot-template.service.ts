import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '../../shared/abstract/service/editors/multi-row-editor.service';
import { QueryService } from '../../shared/services/query.service';
import { PROSPECTING_LOOT_TEMPLATE_TABLE, ProspectingLootTemplate } from '../../shared/types/prospecting-loot-template.type';
import { ItemHandlerService } from './item-handler.service';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '../../shared/types/loot-template.type';

@Injectable({
  providedIn: 'root'
})
export class ProspectingLootTemplateService extends MultiRowEditorService<ProspectingLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: ItemHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      ProspectingLootTemplate,
      PROSPECTING_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      LOOT_TEMPLATE_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

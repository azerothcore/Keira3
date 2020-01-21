import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { QuestHandlerService } from './quest-handler.service';
import { QueryService } from '../../shared/services/query.service';
import { SingleRowEditorService } from '@keira-abstract/service/editors/single-row-editor.service';
import {
  QUEST_TEMPLATE_ADDON_ID,
  QUEST_TEMPLATE_ADDON_TABLE,
  QuestTemplateAddon
} from '@keira-types/quest-template-addon.type';

@Injectable({
  providedIn: 'root'
})
export class QuestTemplateAddonService extends SingleRowEditorService<QuestTemplateAddon> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      QuestTemplateAddon,
      QUEST_TEMPLATE_ADDON_TABLE,
      QUEST_TEMPLATE_ADDON_ID,
      null,
      false,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

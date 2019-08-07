import { Injectable } from '@angular/core';

import { QuestHandlerService } from '../../handlers/quest-handler.service';
import { QueryService } from '../../query.service';
import { SingleRowEditorService } from '../single-row-editor.service';
import {
  QUEST_TEMPLATE_ADDON_ID,
  QUEST_TEMPLATE_ADDON_TABLE,
  QuestTemplateAddon
} from '../../../types/quest-template-addon.type';

@Injectable({
  providedIn: 'root'
})
export class QuestTemplateAddonService extends SingleRowEditorService<QuestTemplateAddon> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      QuestTemplateAddon,
      QUEST_TEMPLATE_ADDON_TABLE,
      QUEST_TEMPLATE_ADDON_ID,
      null,
      false,
      handlerService,
      queryService,
    );
  }
}

import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { QUEST_TEMPLATE_ADDON_ID, QUEST_TEMPLATE_ADDON_TABLE, QuestTemplateAddon } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class QuestTemplateAddonService extends SingleRowEditorService<QuestTemplateAddon> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected handlerService: QuestHandlerService) {
    super(QuestTemplateAddon, QUEST_TEMPLATE_ADDON_TABLE, QUEST_TEMPLATE_ADDON_ID, null, false, handlerService);
  }
}

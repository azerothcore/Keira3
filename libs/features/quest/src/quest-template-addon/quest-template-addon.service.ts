import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { QUEST_TEMPLATE_ADDON_ID, QUEST_TEMPLATE_ADDON_TABLE, QuestTemplateAddon } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class QuestTemplateAddonService extends SingleRowEditorService<QuestTemplateAddon> {
  protected override readonly handlerService = inject(QuestHandlerService);
  protected override _entityClass = QuestTemplateAddon;
  protected override _entityTable = QUEST_TEMPLATE_ADDON_TABLE;
  protected override _entityIdField = QUEST_TEMPLATE_ADDON_ID;
  protected override _entityNameField = null;
  protected override isMainEntity = false;

  constructor() {
    super();
  }
}

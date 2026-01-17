import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { QUEST_TEMPLATE_ID, QUEST_TEMPLATE_NAME, QUEST_TEMPLATE_TABLE, QuestTemplate } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class QuestTemplateService extends SingleRowEditorService<QuestTemplate> {
  protected override readonly handlerService = inject(QuestHandlerService);
  protected override _entityClass = QuestTemplate;
  protected override _entityTable = QUEST_TEMPLATE_TABLE;
  protected override _entityIdField = QUEST_TEMPLATE_ID;
  protected override _entityNameField = QUEST_TEMPLATE_NAME;
  protected override isMainEntity = true;

  constructor() {
    super();
    this.init();
  }
}

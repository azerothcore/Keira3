import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  QUEST_TEMPLATE_LOCALE_ID,
  QUEST_TEMPLATE_LOCALE_ID_2,
  QUEST_TEMPLATE_LOCALE_TABLE,
  QuestTemplateLocale,
} from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class QuestTemplateLocaleService extends MultiRowEditorService<QuestTemplateLocale> {
  protected override readonly handlerService = inject(QuestHandlerService);
  protected override readonly _entityClass = QuestTemplateLocale;
  protected override readonly _entityTable = QUEST_TEMPLATE_LOCALE_TABLE;
  protected override readonly _entityIdField = QUEST_TEMPLATE_LOCALE_ID;
  protected override readonly _entitySecondIdField = QUEST_TEMPLATE_LOCALE_ID_2;

  constructor() {
    super();
    this.init();
  }
}

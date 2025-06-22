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

  constructor() {
    super(QuestTemplateLocale, QUEST_TEMPLATE_LOCALE_TABLE, QUEST_TEMPLATE_LOCALE_ID, QUEST_TEMPLATE_LOCALE_ID_2);
  }
}

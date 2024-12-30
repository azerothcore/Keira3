import { Injectable } from '@angular/core';
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
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: QuestHandlerService) {
    super(QuestTemplateLocale, QUEST_TEMPLATE_LOCALE_TABLE, QUEST_TEMPLATE_LOCALE_ID, QUEST_TEMPLATE_LOCALE_ID_2, handlerService);
  }
}

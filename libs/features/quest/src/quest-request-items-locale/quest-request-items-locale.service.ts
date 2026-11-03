import { Service, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  QUEST_REQUEST_ITEMS_LOCALE_ID,
  QUEST_REQUEST_ITEMS_LOCALE_ID_2,
  QUEST_REQUEST_ITEMS_LOCALE_TABLE,
  QuestRequestItemsLocale,
} from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Service()
export class QuestRequestItemsLocaleService extends MultiRowEditorService<QuestRequestItemsLocale> {
  protected override readonly handlerService = inject(QuestHandlerService);
  protected override readonly _entityClass = QuestRequestItemsLocale;
  protected override readonly _entityTable = QUEST_REQUEST_ITEMS_LOCALE_TABLE;
  protected override readonly _entityIdField = QUEST_REQUEST_ITEMS_LOCALE_ID;
  protected override readonly _entitySecondIdField = QUEST_REQUEST_ITEMS_LOCALE_ID_2;

  constructor() {
    super();
    this.init();
  }
}

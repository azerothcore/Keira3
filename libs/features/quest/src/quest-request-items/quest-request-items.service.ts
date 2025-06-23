import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { QUEST_REQUEST_ITEMS_ID, QUEST_REQUEST_ITEMS_TABLE, QuestRequestItems } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class QuestRequestItemsService extends SingleRowEditorService<QuestRequestItems> {
  protected override readonly handlerService = inject(QuestHandlerService);
  protected override _entityClass = QuestRequestItems;
  protected override _entityTable = QUEST_REQUEST_ITEMS_TABLE;
  protected override _entityIdField = QUEST_REQUEST_ITEMS_ID;
  protected override _entityNameField = null;
  protected override isMainEntity = false;

  constructor() {
    super();
  }
}

import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { QUEST_REQUEST_ITEMS_ID, QUEST_REQUEST_ITEMS_TABLE, QuestRequestItems } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class QuestRequestItemsService extends SingleRowEditorService<QuestRequestItems> {
  protected override readonly handlerService: QuestHandlerService;

  constructor() {
    const handlerService = inject(QuestHandlerService);

    super(QuestRequestItems, QUEST_REQUEST_ITEMS_TABLE, QUEST_REQUEST_ITEMS_ID, null, false, handlerService);

    this.handlerService = handlerService;
  }
}

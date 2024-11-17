import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { QUEST_REQUEST_ITEMS_ID, QUEST_REQUEST_ITEMS_TABLE, QuestRequestItems } from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class QuestRequestItemsService extends SingleRowEditorService<QuestRequestItems> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: QuestHandlerService) {
    super(QuestRequestItems, QUEST_REQUEST_ITEMS_TABLE, QUEST_REQUEST_ITEMS_ID, null, false, handlerService);
  }
}

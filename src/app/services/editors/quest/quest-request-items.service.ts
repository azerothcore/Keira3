import { Injectable } from '@angular/core';

import { QuestHandlerService } from '../../handlers/quest-handler.service';
import { QueryService } from '../../query.service';
import { SingleRowEditorService } from '../single-row-editor.service';
import {
  QUEST_REQUEST_ITEMS_ID,
  QUEST_REQUEST_ITEMS_TABLE,
  QuestRequestItems
} from '../../../types/quest-request-items.type';

@Injectable({
  providedIn: 'root'
})
export class QuestRequestItemsService extends SingleRowEditorService<QuestRequestItems> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      QuestRequestItems,
      QUEST_REQUEST_ITEMS_TABLE,
      QUEST_REQUEST_ITEMS_ID,
      null,
      false,
      handlerService,
      queryService,
    );
  }
}

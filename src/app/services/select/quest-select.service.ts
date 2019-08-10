import { Injectable } from '@angular/core';

import { SelectService } from './select.service';
import {
  QUEST_TEMPLATE_ID,
  QUEST_TEMPLATE_NAME, QUEST_TEMPLATE_SEARCH_FIELDS,
  QUEST_TEMPLATE_TABLE,
  QuestTemplate
} from '../../types/quest-template.type';
import { QueryService } from '../query.service';
import { QuestHandlerService } from '../handlers/quest-handler.service';

@Injectable({
  providedIn: 'root'
})
export class QuestSelectService extends SelectService<QuestTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected queryService: QueryService,
    public handlerService: QuestHandlerService,
  ) {
    super(
      queryService,
      handlerService,
      QUEST_TEMPLATE_TABLE,
      QUEST_TEMPLATE_ID,
      QUEST_TEMPLATE_NAME,
      QUEST_TEMPLATE_SEARCH_FIELDS,
    );
  }
}

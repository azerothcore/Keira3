import { Injectable } from '@angular/core';

import { SingleRowEditorService } from '../single-row-editor.service';
import {
  QUEST_TEMPLATE_ID,
  QUEST_TEMPLATE_NAME,
  QUEST_TEMPLATE_TABLE,
  QuestTemplate
} from '../../../types/quest-template.type';
import { QueryService } from '../../query.service';
import { QuestHandlerService } from '../../handlers/quest-handler.service';

@Injectable({
  providedIn: 'root'
})
export class QuestTemplateService extends SingleRowEditorService<QuestTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      QuestTemplate,
      QUEST_TEMPLATE_TABLE,
      QUEST_TEMPLATE_ID,
      QUEST_TEMPLATE_NAME,
      true,
      handlerService,
      queryService,
    );
  }
}

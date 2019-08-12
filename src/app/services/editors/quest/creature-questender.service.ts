import { Injectable } from '@angular/core';

import { QuestHandlerService } from '../../handlers/quest-handler.service';
import { QueryService } from '../../query.service';
import { MultiRowEditorService } from '../multi-row-editor.service';
import {
  CREATURE_QUESTENDER_ID, CREATURE_QUESTENDER_ID_2,
  CREATURE_QUESTENDER_TABLE,
  CreatureQuestender
} from '../../../types/creature-questender.type';

@Injectable({
  providedIn: 'root'
})
export class CreatureQuestenderService extends MultiRowEditorService<CreatureQuestender> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      CreatureQuestender,
      CREATURE_QUESTENDER_TABLE,
      CREATURE_QUESTENDER_ID,
      CREATURE_QUESTENDER_ID_2,
      handlerService,
      queryService,
    );
  }
}

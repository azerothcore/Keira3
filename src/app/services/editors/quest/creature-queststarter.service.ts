import { Injectable } from '@angular/core';

import { QuestHandlerService } from '../../handlers/quest-handler.service';
import { QueryService } from '../../query.service';
import { MultiRowEditorService } from '../multi-row-editor.service';
import {
  CREATURE_QUESTSTARTER_ID, CREATURE_QUESTSTARTER_ID_2,
  CREATURE_QUESTSTARTER_TABLE,
  CreatureQueststarter
} from '../../../types/creature-queststarter.type';

@Injectable({
  providedIn: 'root'
})
export class CreatureQueststarterService extends MultiRowEditorService<CreatureQueststarter> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      CreatureQueststarter,
      CREATURE_QUESTSTARTER_TABLE,
      CREATURE_QUESTSTARTER_ID,
      CREATURE_QUESTSTARTER_ID_2,
      handlerService,
      queryService,
    );
  }
}

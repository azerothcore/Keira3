import { Injectable } from '@angular/core';

import { QuestHandlerService } from '../../handlers/quest-handler.service';
import { QueryService } from '../../query.service';
import { SingleRowEditorService } from '../single-row-editor.service';
import {
  CREATURE_QUESTSTARTER_ID,
  CREATURE_QUESTSTARTER_TABLE,
  CreatureQueststarter
} from '../../../types/creature-queststarter.type';

@Injectable({
  providedIn: 'root'
})
export class CreatureQueststarterService extends SingleRowEditorService<CreatureQueststarter> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      CreatureQueststarter,
      CREATURE_QUESTSTARTER_TABLE,
      CREATURE_QUESTSTARTER_ID,
      null,
      false,
      handlerService,
      queryService,
    );
  }
}

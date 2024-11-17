import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  CREATURE_QUESTENDER_ID,
  CREATURE_QUESTENDER_ID_2,
  CREATURE_QUESTENDER_TABLE,
  CreatureQuestender,
} from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureQuestenderService extends MultiRowEditorService<CreatureQuestender> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: QuestHandlerService) {
    super(CreatureQuestender, CREATURE_QUESTENDER_TABLE, CREATURE_QUESTENDER_ID, CREATURE_QUESTENDER_ID_2, handlerService);
  }
}

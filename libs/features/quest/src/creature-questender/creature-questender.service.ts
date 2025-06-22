import { Injectable, inject } from '@angular/core';
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
  protected override readonly handlerService = inject(QuestHandlerService);

  constructor() {
    super(CreatureQuestender, CREATURE_QUESTENDER_TABLE, CREATURE_QUESTENDER_ID, CREATURE_QUESTENDER_ID_2);
  }
}

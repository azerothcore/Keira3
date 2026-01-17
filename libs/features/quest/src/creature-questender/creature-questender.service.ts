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
  protected override readonly _entityClass = CreatureQuestender;
  protected override readonly _entityTable = CREATURE_QUESTENDER_TABLE;
  protected override readonly _entityIdField = CREATURE_QUESTENDER_ID;
  protected override readonly _entitySecondIdField = CREATURE_QUESTENDER_ID_2;

  constructor() {
    super();
    this.init();
  }
}

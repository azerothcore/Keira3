import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  CREATURE_QUESTSTARTER_ID,
  CREATURE_QUESTSTARTER_ID_2,
  CREATURE_QUESTSTARTER_TABLE,
  CreatureQueststarter,
} from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureQueststarterService extends MultiRowEditorService<CreatureQueststarter> {
  protected override readonly handlerService = inject(QuestHandlerService);
  protected override readonly _entityClass = CreatureQueststarter;
  protected override readonly _entityTable = CREATURE_QUESTSTARTER_TABLE;
  protected override readonly _entityIdField = CREATURE_QUESTSTARTER_ID;
  protected override readonly _entitySecondIdField = CREATURE_QUESTSTARTER_ID_2;

  constructor() {
    super();
  }
}

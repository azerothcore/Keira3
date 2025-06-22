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
  protected override readonly handlerService: QuestHandlerService;

  constructor() {
    const handlerService = inject(QuestHandlerService);

    super(CreatureQueststarter, CREATURE_QUESTSTARTER_TABLE, CREATURE_QUESTSTARTER_ID, CREATURE_QUESTSTARTER_ID_2, handlerService);

    this.handlerService = handlerService;
  }
}

import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  GAMEOBJECT_QUESTSTARTER_ID,
  GAMEOBJECT_QUESTSTARTER_ID_2,
  GAMEOBJECT_QUESTSTARTER_TABLE,
  GameobjectQueststarter,
} from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectQueststarterService extends MultiRowEditorService<GameobjectQueststarter> {
  protected override readonly handlerService = inject(QuestHandlerService);

  constructor() {
    super(GameobjectQueststarter, GAMEOBJECT_QUESTSTARTER_TABLE, GAMEOBJECT_QUESTSTARTER_ID, GAMEOBJECT_QUESTSTARTER_ID_2);
  }
}

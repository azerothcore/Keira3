import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  GAMEOBJECT_QUESTENDER_ID,
  GAMEOBJECT_QUESTENDER_ID_2,
  GAMEOBJECT_QUESTENDER_TABLE,
  GameobjectQuestender,
} from '@keira/shared/acore-world-model';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectQuestenderService extends MultiRowEditorService<GameobjectQuestender> {
  protected override readonly handlerService = inject(QuestHandlerService);
  protected override readonly _entityClass = GameobjectQuestender;
  protected override readonly _entityTable = GAMEOBJECT_QUESTENDER_TABLE;
  protected override readonly _entityIdField = GAMEOBJECT_QUESTENDER_ID;
  protected override readonly _entitySecondIdField = GAMEOBJECT_QUESTENDER_ID_2;

  constructor() {
    super();
    this.init();
  }
}

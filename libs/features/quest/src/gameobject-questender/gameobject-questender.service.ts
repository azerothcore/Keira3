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
  protected override readonly handlerService: QuestHandlerService;

  constructor() {
    const handlerService = inject(QuestHandlerService);

    super(GameobjectQuestender, GAMEOBJECT_QUESTENDER_TABLE, GAMEOBJECT_QUESTENDER_ID, GAMEOBJECT_QUESTENDER_ID_2, handlerService);

    this.handlerService = handlerService;
  }
}

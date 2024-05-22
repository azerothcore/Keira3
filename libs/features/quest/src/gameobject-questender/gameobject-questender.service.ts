import { Injectable } from '@angular/core';
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
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: QuestHandlerService) {
    super(GameobjectQuestender, GAMEOBJECT_QUESTENDER_TABLE, GAMEOBJECT_QUESTENDER_ID, GAMEOBJECT_QUESTENDER_ID_2, handlerService);
  }
}

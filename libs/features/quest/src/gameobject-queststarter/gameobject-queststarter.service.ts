import { Injectable } from '@angular/core';
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
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: QuestHandlerService) {
    super(GameobjectQueststarter, GAMEOBJECT_QUESTSTARTER_TABLE, GAMEOBJECT_QUESTSTARTER_ID, GAMEOBJECT_QUESTSTARTER_ID_2, handlerService);
  }
}

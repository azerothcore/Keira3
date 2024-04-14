import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  GAMEOBJECT_QUESTITEM_ID,
  GAMEOBJECT_QUESTITEM_ID_2,
  GAMEOBJECT_QUESTITEM_TABLE,
  GameobjectQuestitem,
} from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectQuestitemService extends MultiRowEditorService<GameobjectQuestitem> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected handlerService: GameobjectHandlerService) {
    super(GameobjectQuestitem, GAMEOBJECT_QUESTITEM_TABLE, GAMEOBJECT_QUESTITEM_ID, GAMEOBJECT_QUESTITEM_ID_2, handlerService);
  }
}

import { Injectable } from '@angular/core';

import { QuestHandlerService } from '../../handlers/quest-handler.service';
import { QueryService } from '../../query.service';
import { SingleRowEditorService } from '../single-row-editor.service';
import {
  GAMEOBJECT_QUESTSTARTER_ID,
  GAMEOBJECT_QUESTSTARTER_TABLE,
  GameobjectQueststarter
} from '../../../types/gameobject-queststarter.type';

@Injectable({
  providedIn: 'root'
})
export class GameobjectQueststarterService extends SingleRowEditorService<GameobjectQueststarter> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      GameobjectQueststarter,
      GAMEOBJECT_QUESTSTARTER_TABLE,
      GAMEOBJECT_QUESTSTARTER_ID,
      null,
      false,
      handlerService,
      queryService,
    );
  }
}

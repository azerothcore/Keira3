import { Injectable } from '@angular/core';

import { QuestHandlerService } from '../../handlers/quest-handler.service';
import { QueryService } from '../../query.service';
import { MultiRowEditorService } from '../multi-row-editor.service';
import {
  GAMEOBJECT_QUESTSTARTER_ID, GAMEOBJECT_QUESTSTARTER_ID_2,
  GAMEOBJECT_QUESTSTARTER_TABLE,
  GameobjectQueststarter
} from '../../../types/gameobject-queststarter.type';

@Injectable({
  providedIn: 'root'
})
export class GameobjectQueststarterService extends MultiRowEditorService<GameobjectQueststarter> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      GameobjectQueststarter,
      GAMEOBJECT_QUESTSTARTER_TABLE,
      GAMEOBJECT_QUESTSTARTER_ID,
      GAMEOBJECT_QUESTSTARTER_ID_2,
      handlerService,
      queryService,
    );
  }
}

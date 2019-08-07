import { Injectable } from '@angular/core';

import { QuestHandlerService } from '../../handlers/quest-handler.service';
import { QueryService } from '../../query.service';
import { SingleRowEditorService } from '../single-row-editor.service';
import {
  GAMEOBJECT_QUESTENDER_ID,
  GAMEOBJECT_QUESTENDER_TABLE,
  GameobjectQuestender
} from '../../../types/gameobject-questender.type';

@Injectable({
  providedIn: 'root'
})
export class GameobjectQuestenderService extends SingleRowEditorService<GameobjectQuestender> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      GameobjectQuestender,
      GAMEOBJECT_QUESTENDER_TABLE,
      GAMEOBJECT_QUESTENDER_ID,
      null,
      false,
      handlerService,
      queryService,
    );
  }
}

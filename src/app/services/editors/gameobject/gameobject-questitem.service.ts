import { Injectable } from '@angular/core';

import { GameobjectHandlerService } from '../../handlers/gameobject-handler.service';
import { QueryService } from '../../query.service';
import { MultiRowEditorService } from '../multi-row-editor.service';
import {
  GAMEOBJECT_QUESTITEM_ID,
  GAMEOBJECT_QUESTITEM_ID_2,
  GAMEOBJECT_QUESTITEM_TABLE,
  GameobjectQuestitem
} from '../../../types/gameobject-questitem.type';

@Injectable({
  providedIn: 'root'
})
export class GameobjectQuestitemService extends MultiRowEditorService<GameobjectQuestitem> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      GameobjectQuestitem,
      GAMEOBJECT_QUESTITEM_TABLE,
      GAMEOBJECT_QUESTITEM_ID,
      GAMEOBJECT_QUESTITEM_ID_2,
      handlerService,
      queryService
    );
  }
}

import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { QuestHandlerService } from './quest-handler.service';
import { QueryService } from '../../shared/services/query.service';
import { MultiRowEditorService } from '../../shared/abstract/service/editors/multi-row-editor.service';
import {
  GAMEOBJECT_QUESTENDER_ID, GAMEOBJECT_QUESTENDER_ID_2,
  GAMEOBJECT_QUESTENDER_TABLE,
  GameobjectQuestender
} from '../../shared/types/gameobject-questender.type';

@Injectable({
  providedIn: 'root'
})
export class GameobjectQuestenderService extends MultiRowEditorService<GameobjectQuestender> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: QueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      GameobjectQuestender,
      GAMEOBJECT_QUESTENDER_TABLE,
      GAMEOBJECT_QUESTENDER_ID,
      GAMEOBJECT_QUESTENDER_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

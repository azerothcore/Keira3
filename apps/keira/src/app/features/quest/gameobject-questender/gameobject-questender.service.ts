import { Injectable } from '@angular/core';
import { MultiRowEditorService, MysqlQueryService } from '@keira/core';
import {
  GAMEOBJECT_QUESTENDER_ID,
  GAMEOBJECT_QUESTENDER_ID_2,
  GAMEOBJECT_QUESTENDER_TABLE,
  GameobjectQuestender,
} from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable()
export class GameobjectQuestenderService extends MultiRowEditorService<GameobjectQuestender> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    readonly queryService: MysqlQueryService,
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

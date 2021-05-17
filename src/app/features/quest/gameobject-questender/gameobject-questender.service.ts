import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { QuestHandlerService } from '../quest-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import {
  GAMEOBJECT_QUESTENDER_ID,
  GAMEOBJECT_QUESTENDER_ID_2,
  GAMEOBJECT_QUESTENDER_TABLE,
  GameobjectQuestender,
} from '@keira-types/gameobject-questender.type';

@Injectable()
export class GameobjectQuestenderService extends MultiRowEditorService<GameobjectQuestender> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    public readonly queryService: MysqlQueryService,
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

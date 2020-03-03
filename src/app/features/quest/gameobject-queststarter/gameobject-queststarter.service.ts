import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { QuestHandlerService } from '../quest-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import {
  GAMEOBJECT_QUESTSTARTER_ID, GAMEOBJECT_QUESTSTARTER_ID_2,
  GAMEOBJECT_QUESTSTARTER_TABLE,
  GameobjectQueststarter
} from '@keira-types/gameobject-queststarter.type';

@Injectable()
export class GameobjectQueststarterService extends MultiRowEditorService<GameobjectQueststarter> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    protected queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      GameobjectQueststarter,
      GAMEOBJECT_QUESTSTARTER_TABLE,
      GAMEOBJECT_QUESTSTARTER_ID,
      GAMEOBJECT_QUESTSTARTER_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

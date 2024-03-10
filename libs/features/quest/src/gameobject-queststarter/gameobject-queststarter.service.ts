import { Injectable } from '@angular/core';
import { MultiRowEditorService, MysqlQueryService } from '@keira/shared/core';
import {
  GAMEOBJECT_QUESTSTARTER_ID,
  GAMEOBJECT_QUESTSTARTER_ID_2,
  GAMEOBJECT_QUESTSTARTER_TABLE,
  GameobjectQueststarter,
} from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { QuestHandlerService } from '../quest-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectQueststarterService extends MultiRowEditorService<GameobjectQueststarter> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: QuestHandlerService,
    readonly queryService: MysqlQueryService,
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

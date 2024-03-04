import { Injectable } from '@angular/core';
import { MultiRowEditorService, MysqlQueryService } from '@keira/core';
import {
  GAMEOBJECT_QUESTITEM_ID,
  GAMEOBJECT_QUESTITEM_ID_2,
  GAMEOBJECT_QUESTITEM_TABLE,
  GameobjectQuestitem,
} from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable()
export class GameobjectQuestitemService extends MultiRowEditorService<GameobjectQuestitem> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      GameobjectQuestitem,
      GAMEOBJECT_QUESTITEM_TABLE,
      GAMEOBJECT_QUESTITEM_ID,
      GAMEOBJECT_QUESTITEM_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

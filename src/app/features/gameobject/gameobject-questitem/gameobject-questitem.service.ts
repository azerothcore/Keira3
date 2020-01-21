import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { GameobjectHandlerService } from '../gameobject-handler.service';
import { QueryService } from '@keira-shared/services/query.service';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import {
  GAMEOBJECT_QUESTITEM_ID,
  GAMEOBJECT_QUESTITEM_ID_2,
  GAMEOBJECT_QUESTITEM_TABLE,
  GameobjectQuestitem
} from '@keira-types/gameobject-questitem.type';

@Injectable()
export class GameobjectQuestitemService extends MultiRowEditorService<GameobjectQuestitem> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    protected queryService: QueryService,
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

import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import {
  GameobjectSpawn,
  GAMEOBJECT_SPAWN_ID,
  GAMEOBJECT_SPAWN_ID_2,
  GAMEOBJECT_SPAWN_TABLE,
} from '@keira-types/gameobject-spawn.type';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';

@Injectable()
export class GameobjectSpawnService extends MultiRowEditorService<GameobjectSpawn> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    public readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      GameobjectSpawn,
      GAMEOBJECT_SPAWN_TABLE,
      GAMEOBJECT_SPAWN_ID,
      GAMEOBJECT_SPAWN_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

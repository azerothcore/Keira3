import { Injectable } from '@angular/core';
import { MultiRowEditorService, MysqlQueryService } from '@keira/shared/core';
import { GAMEOBJECT_SPAWN_ID, GAMEOBJECT_SPAWN_ID_2, GAMEOBJECT_SPAWN_TABLE, GameobjectSpawn } from '@keira/shared/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectSpawnService extends MultiRowEditorService<GameobjectSpawn> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(GameobjectSpawn, GAMEOBJECT_SPAWN_TABLE, GAMEOBJECT_SPAWN_ID, GAMEOBJECT_SPAWN_ID_2, handlerService, queryService, toastrService);
  }
}

import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { GameobjectSpawn, GAMEOBJECT_SPAWN_ID, GAMEOBJECT_SPAWN_ID_2, GAMEOBJECT_SPAWN_TABLE } from '@keira-types/gameobject-spawn.type';
import { ToastrService } from 'ngx-toastr';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { SaveQueryService } from '@keira-shared/services/save-query.service';

@Injectable()
export class GameobjectSpawnService extends MultiRowEditorService<GameobjectSpawn> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    public readonly queryService: MysqlQueryService,
    public readonly saveQueryService: SaveQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      GameobjectSpawn,
      GAMEOBJECT_SPAWN_TABLE,
      GAMEOBJECT_SPAWN_ID,
      GAMEOBJECT_SPAWN_ID_2,
      handlerService,
      queryService,
      saveQueryService,
      toastrService,
    );
  }
}

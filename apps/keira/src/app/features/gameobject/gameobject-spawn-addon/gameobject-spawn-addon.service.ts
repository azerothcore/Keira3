import { Injectable } from '@angular/core';
import { MultiRowExternalEditorService, MysqlQueryService } from '@keira/core';
import { GAMEOBJECT_SPAWN_ADDON_ID_2, GAMEOBJECT_SPAWN_ADDON_TABLE, GameobjectSpawnAddon } from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable()
export class GameobjectSpawnAddonService extends MultiRowExternalEditorService<GameobjectSpawnAddon> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(GameobjectSpawnAddon, GAMEOBJECT_SPAWN_ADDON_TABLE, GAMEOBJECT_SPAWN_ADDON_ID_2, handlerService, queryService, toastrService);
  }

  selectQuery(id: string | number) {
    return this.queryService.query<GameobjectSpawnAddon>(
      `SELECT a.* FROM gameobject AS g INNER JOIN gameobject_addon AS a ON g.guid = a.guid WHERE g.id = ${id}`,
    );
  }
}

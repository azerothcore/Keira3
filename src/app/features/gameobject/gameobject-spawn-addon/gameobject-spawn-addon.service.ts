import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowExternalEditorService } from '@keira-abstract/service/editors/multi-row-external-editor.service';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  GAMEOBJECT_SPAWN_ADDON_ID_2,
  GAMEOBJECT_SPAWN_ADDON_TABLE,
  GameobjectSpawnAddon
} from '@keira-types/gameobject-spawn-addon.type';

@Injectable()
export class GameobjectSpawnAddonService extends MultiRowExternalEditorService<GameobjectSpawnAddon> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    public readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      GameobjectSpawnAddon,
      GAMEOBJECT_SPAWN_ADDON_TABLE,
      GAMEOBJECT_SPAWN_ADDON_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }

  selectQuery(id: string|number) {
    return this.queryService.query<GameobjectSpawnAddon>(
      `SELECT a.* FROM gameobject AS g INNER JOIN gameobject_addon AS a ON g.guid = a.guid WHERE g.id = ${id}`
    );
  }
}

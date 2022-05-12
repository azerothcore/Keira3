import { Injectable } from '@angular/core';
import { MultiRowExternalEditorService } from '@keira-abstract/service/editors/multi-row-external-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { CreatureSpawnAddon, CREATURE_SPAWN_ADDON_ID_2, CREATURE_SPAWN_ADDON_TABLE } from '@keira-types/creature-spawn-addon.type';
import { ToastrService } from 'ngx-toastr';
import { CreatureHandlerService } from '../creature-handler.service';
import { SaveQueryService } from '@keira-shared/services/save-query.service';

@Injectable()
export class CreatureSpawnAddonService extends MultiRowExternalEditorService<CreatureSpawnAddon> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    public readonly queryService: MysqlQueryService,
    public readonly saveQueryService: SaveQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      CreatureSpawnAddon,
      CREATURE_SPAWN_ADDON_TABLE,
      CREATURE_SPAWN_ADDON_ID_2,
      handlerService,
      queryService,
      saveQueryService,
      toastrService,
    );
  }

  selectQuery(id: string | number) {
    return this.queryService.query<CreatureSpawnAddon>(
      `SELECT a.* FROM creature AS c INNER JOIN creature_addon AS a ON c.guid = a.guid WHERE c.id1 = ${id}`,
    );
  }
}

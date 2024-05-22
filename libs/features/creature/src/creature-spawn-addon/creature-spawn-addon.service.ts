import { Injectable } from '@angular/core';
import { CREATURE_SPAWN_ADDON_ID_2, CREATURE_SPAWN_ADDON_TABLE, CreatureSpawnAddon } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';
import { MultiRowExternalEditorService } from '@keira/shared/base-abstract-classes';

@Injectable({
  providedIn: 'root',
})
export class CreatureSpawnAddonService extends MultiRowExternalEditorService<CreatureSpawnAddon> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected override readonly handlerService: CreatureHandlerService) {
    super(CreatureSpawnAddon, CREATURE_SPAWN_ADDON_TABLE, CREATURE_SPAWN_ADDON_ID_2, handlerService);
  }

  selectQuery(id: string | number) {
    return this.queryService.query<CreatureSpawnAddon>(
      `SELECT a.* FROM creature AS c INNER JOIN creature_addon AS a ON c.guid = a.guid WHERE c.id1 = ${id}`,
    );
  }
}

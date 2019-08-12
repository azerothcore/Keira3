import { Injectable } from '@angular/core';

import { MultiRowExternalEditorService } from '../multi-row-external-editor.service';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import {
  CREATURE_SPAWN_ADDON_ID_2,
  CREATURE_SPAWN_ADDON_TABLE,
  CreatureSpawnAddon
} from '../../../types/creature-spawn-addon.type';

@Injectable({
  providedIn: 'root'
})
export class CreatureSpawnAddonService extends MultiRowExternalEditorService<CreatureSpawnAddon> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      CreatureSpawnAddon,
      CREATURE_SPAWN_ADDON_TABLE,
      CREATURE_SPAWN_ADDON_ID_2,
      handlerService,
      queryService,
    );
  }

  selectQuery(id: string|number) {
    return this.queryService.query<CreatureSpawnAddon>(
      `SELECT a.* FROM creature AS c INNER JOIN creature_addon AS a ON c.guid = a.guid WHERE c.id = ${id}`
    );
  }
}

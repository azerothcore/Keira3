import { Injectable } from '@angular/core';

import { MultiRowExternalEditorService } from '../multi-row-external-editor.service';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import {
  SPAWNS_ADDON_ID_2,
  SPAWNS_ADDON_TABLE,
  SpawnsAddon
} from '../../../types/spawns-addon.type';

@Injectable({
  providedIn: 'root'
})
export class SpawnsAddonService extends MultiRowExternalEditorService<SpawnsAddon> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      SpawnsAddon,
      SPAWNS_ADDON_TABLE,
      SPAWNS_ADDON_ID_2,
      handlerService,
      queryService,
    );
  }

  selectQuery(id: string|number) {
    return this.queryService.query<SpawnsAddon>(
      `SELECT a.* FROM creature AS c INNER JOIN creature_addon AS a ON c.guid = a.guid WHERE c.id = ${id}`
    );
  }
}

import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import {
  SPAWNS_ADDON_ID,
  SPAWNS_ADDON_ID_2,
  SPAWNS_ADDON_TABLE,
  SpawnsAddon
} from '../../../components/editors/creature/spawns-addon/spawns-addon.type';

@Injectable({
  providedIn: 'root'
})
export class SpawnsAddonService extends MultiRowEditorService<SpawnsAddon> {

  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      SpawnsAddon,
      SPAWNS_ADDON_TABLE,
      SPAWNS_ADDON_ID,
      SPAWNS_ADDON_ID_2,
      handlerService,
      queryService,
    );
  }

  disableEntityIdField() {}

  // TODO: override selectQuery()
}

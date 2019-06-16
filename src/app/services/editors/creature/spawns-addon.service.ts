import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';
import {
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
      null,
      SPAWNS_ADDON_ID_2,
      handlerService,
      queryService,
    );
  }

  disableEntityIdField() {}

  protected updateFullQuery(): void {
    this._fullQuery = this.queryService.getFullDeleteInsertQuery<SpawnsAddon>(
      this._entityTable,
      this._newRows,
      null,
      SPAWNS_ADDON_ID_2,
    );
  }

  protected updateDiffQuery(): void {
    this._diffQuery = this.queryService.getDiffDeleteInsertTwoKeysQuery<SpawnsAddon>(
      this._entityTable,
      null,
      SPAWNS_ADDON_ID_2,
      this._originalRows,
      this._newRows,
    );
  }

  selectQuery(id: string|number) {
    return this.queryService.query<SpawnsAddon>(
      `SELECT a.* FROM creature AS c INNER JOIN creature_addon AS a ON c.guid = a.guid WHERE c.id = ${id}`
    );
  }
}

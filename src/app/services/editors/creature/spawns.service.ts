import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { Spawns, SPAWNS_ID, SPAWNS_ID_2, SPAWNS_TABLE } from '../../../types/spawns.type';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';

@Injectable({
  providedIn: 'root'
})
export class SpawnsService extends MultiRowEditorService<Spawns> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      Spawns,
      SPAWNS_TABLE,
      SPAWNS_ID,
      SPAWNS_ID_2,
      handlerService,
      queryService,
    );
  }
}

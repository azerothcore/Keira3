import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import { CreatureSpawn, CREATURE_SPAWN_ID, CREATURE_SPAWN_ID_2, CREATURE_SPAWN_TABLE } from '../../../types/creature-spawn.type';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';

@Injectable({
  providedIn: 'root'
})
export class CreatureSpawnService extends MultiRowEditorService<CreatureSpawn> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      CreatureSpawn,
      CREATURE_SPAWN_TABLE,
      CREATURE_SPAWN_ID,
      CREATURE_SPAWN_ID_2,
      handlerService,
      queryService,
    );
  }
}

import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import {
  GameobjectSpawn,
  GAMEOBJECT_SPAWNS_ID,
  GAMEOBJECT_SPAWNS_ID_2,
  GAMEOBJECT_SPAWNS_TABLE
} from '../../../types/gameobject-spawn.type';
import { CreatureHandlerService } from '../../handlers/creature-handler.service';
import { QueryService } from '../../query.service';

@Injectable({
  providedIn: 'root'
})
export class GameobjectSpawnService extends MultiRowEditorService<GameobjectSpawn> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: CreatureHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      GameobjectSpawn,
      GAMEOBJECT_SPAWNS_TABLE,
      GAMEOBJECT_SPAWNS_ID,
      GAMEOBJECT_SPAWNS_ID_2,
      handlerService,
      queryService,
    );
  }
}

import { Injectable } from '@angular/core';

import { MultiRowEditorService } from '../multi-row-editor.service';
import {
  GameobjectSpawn,
  GAMEOBJECT_SPAWN_ID,
  GAMEOBJECT_SPAWN_ID_2,
  GAMEOBJECT_SPAWN_TABLE
} from '../../../types/gameobject-spawn.type';
import { GameobjectHandlerService } from '../../handlers/gameobject-handler.service';
import { QueryService } from '../../query.service';

@Injectable({
  providedIn: 'root'
})
export class GameobjectSpawnService extends MultiRowEditorService<GameobjectSpawn> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: GameobjectHandlerService,
    protected queryService: QueryService,
  ) {
    super(
      GameobjectSpawn,
      GAMEOBJECT_SPAWN_TABLE,
      GAMEOBJECT_SPAWN_ID,
      GAMEOBJECT_SPAWN_ID_2,
      handlerService,
      queryService,
    );
  }
}

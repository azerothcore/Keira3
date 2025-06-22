import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GAMEOBJECT_SPAWN_ID, GAMEOBJECT_SPAWN_ID_2, GAMEOBJECT_SPAWN_TABLE, GameobjectSpawn } from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectSpawnService extends MultiRowEditorService<GameobjectSpawn> {
  protected override readonly handlerService = inject(GameobjectHandlerService);

  constructor() {
    super(GameobjectSpawn, GAMEOBJECT_SPAWN_TABLE, GAMEOBJECT_SPAWN_ID, GAMEOBJECT_SPAWN_ID_2);
  }
}

import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { GAMEOBJECT_SPAWN_ID, GAMEOBJECT_SPAWN_ID_2, GAMEOBJECT_SPAWN_TABLE, GameobjectSpawn } from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';

@Injectable({
  providedIn: 'root',
})
export class GameobjectSpawnService extends MultiRowEditorService<GameobjectSpawn> {
  protected override readonly handlerService = inject(GameobjectHandlerService);
  protected override readonly _entityClass = GameobjectSpawn;
  protected override readonly _entityTable = GAMEOBJECT_SPAWN_TABLE;
  protected override readonly _entityIdField = GAMEOBJECT_SPAWN_ID;
  protected override readonly _entitySecondIdField = GAMEOBJECT_SPAWN_ID_2;

  constructor() {
    super();
    this.init();
  }
}

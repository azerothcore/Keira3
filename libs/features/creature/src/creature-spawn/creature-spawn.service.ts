import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { CREATURE_SPAWN_ID, CREATURE_SPAWN_ID_2, CREATURE_SPAWN_TABLE, CreatureSpawn } from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureSpawnService extends MultiRowEditorService<CreatureSpawn> {
  protected override readonly handlerService = inject(CreatureHandlerService);

  constructor() {
    super(CreatureSpawn, CREATURE_SPAWN_TABLE, CREATURE_SPAWN_ID, CREATURE_SPAWN_ID_2);
  }
}

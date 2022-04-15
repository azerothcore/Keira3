import { Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { DYNAMIC_FLAGS } from '@keira-constants/flags/dynamic-flags';
import { NPC_FLAGS } from '@keira-constants/flags/npc-flags';
import { PHASE_MASK } from '@keira-constants/flags/phase-mask';
import { SPAWN_MASK } from '@keira-constants/flags/spawn-mask';
import { UNIT_FLAGS } from '@keira-constants/flags/unit-flags';
import { MOVEMENT_TYPE } from '@keira-constants/options/movement-type';
import { CreatureSpawn } from '@keira-types/creature-spawn.type';
import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureSpawnService } from './creature-spawn.service';

@Component({
  selector: 'keira-creature-spawn',
  templateUrl: './creature-spawn.component.html',
  styleUrls: ['./creature-spawn.component.scss'],
})
export class CreatureSpawnComponent extends MultiRowEditorComponent<CreatureSpawn> {
  public readonly UNIT_FLAGS = UNIT_FLAGS;
  public readonly MOVEMENT_TYPE = MOVEMENT_TYPE;
  public readonly NPC_FLAGS = NPC_FLAGS;
  public readonly DYNAMIC_FLAGS = DYNAMIC_FLAGS;
  public readonly SPAWN_MASK = SPAWN_MASK;
  public readonly PHASE_MASK = PHASE_MASK;

  public readonly SPAWN_DIST_TOOLTIP =
    'The maximum distance that the creature may spawn from its spawn point. ' +
    'Also controls how far away the creature can walk from its spawn point if its MovementType = 1.';

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: CreatureSpawnService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}

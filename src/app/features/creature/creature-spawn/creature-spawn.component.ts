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
  readonly UNIT_FLAGS = UNIT_FLAGS;
  readonly MOVEMENT_TYPE = MOVEMENT_TYPE;
  readonly NPC_FLAGS = NPC_FLAGS;
  readonly DYNAMIC_FLAGS = DYNAMIC_FLAGS;
  readonly SPAWN_MASK = SPAWN_MASK;
  readonly PHASE_MASK = PHASE_MASK;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: CreatureSpawnService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}

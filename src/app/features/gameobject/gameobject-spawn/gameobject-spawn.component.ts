import { Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { PHASE_MASK } from '@keira-constants/flags/phase-mask';
import { SPAWN_MASK } from '@keira-constants/flags/spawn-mask';
import { GameobjectSpawn } from '@keira-types/gameobject-spawn.type';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectSpawnService } from './gameobject-spawn.service';

@Component({
  selector: 'keira-gameobject-spawn',
  templateUrl: './gameobject-spawn.component.html',
  styleUrls: ['./gameobject-spawn.component.scss'],
})
export class GameobjectSpawnComponent extends MultiRowEditorComponent<GameobjectSpawn> {
  readonly SPAWN_MASK = SPAWN_MASK;
  readonly PHASE_MASK = PHASE_MASK;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: GameobjectSpawnService, public handlerService: GameobjectHandlerService) {
    super(editorService, handlerService);
  }
}

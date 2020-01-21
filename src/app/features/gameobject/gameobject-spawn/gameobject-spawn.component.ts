import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../../shared/abstract/components/editors/multi-row-editor.component';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectSpawn } from '../../../shared/types/gameobject-spawn.type';
import { GameobjectSpawnService } from '../gameobject-spawn.service';
import { SPAWN_MASK } from '../../../shared/constants/flags/spawn-mask';
import { PHASE_MASK } from '../../../shared/constants/flags/phase-mask';

@Component({
  selector: 'app-gameobject-spawn',
  templateUrl: './gameobject-spawn.component.html',
  styleUrls: ['./gameobject-spawn.component.scss']
})
export class GameobjectSpawnComponent extends MultiRowEditorComponent<GameobjectSpawn> {

  public readonly SPAWN_MASK = SPAWN_MASK;
  public readonly PHASE_MASK = PHASE_MASK;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectSpawnService,
    public handlerService: GameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }
}


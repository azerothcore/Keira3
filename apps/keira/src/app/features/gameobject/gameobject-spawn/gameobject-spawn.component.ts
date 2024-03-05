import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/core';
import { GameobjectSpawn, PHASE_MASK, SPAWN_MASK } from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectSpawnService } from './gameobject-spawn.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-spawn',
  templateUrl: './gameobject-spawn.component.html',
  styleUrls: ['./gameobject-spawn.component.scss'],
})
export class GameobjectSpawnComponent extends MultiRowEditorComponent<GameobjectSpawn> {
  readonly SPAWN_MASK = SPAWN_MASK;
  readonly PHASE_MASK = PHASE_MASK;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectSpawnService,
    public handlerService: GameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

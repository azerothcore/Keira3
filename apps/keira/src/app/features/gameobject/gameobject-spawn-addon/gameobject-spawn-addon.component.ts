import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira/shared/core';
import { GameobjectSpawnAddon, INVISIBILITY_TYPE } from '@keira/shared/acore-world-model';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectSpawnAddonService } from './gameobject-spawn-addon.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-gameobject-spawn-addon',
  templateUrl: './gameobject-spawn-addon.component.html',
})
export class GameobjectSpawnAddonComponent extends MultiRowEditorComponent<GameobjectSpawnAddon> {
  readonly INVISIBILITY_TYPE = INVISIBILITY_TYPE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectSpawnAddonService,
    public handlerService: GameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

import { Component } from '@angular/core';
import { MultiRowEditorComponent } from '@keira-abstract/components/editors/multi-row-editor.component';
import { INVISIBILITY_TYPE } from '@keira-constants/options/invisibility-type';
import { GameobjectSpawnAddon } from '@keira-types/gameobject-spawn-addon.type';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectSpawnAddonService } from './gameobject-spawn-addon.service';

@Component({
  selector: 'keira-gameobject-spawn-addon',
  templateUrl: './gameobject-spawn-addon.component.html',
})
export class GameobjectSpawnAddonComponent extends MultiRowEditorComponent<GameobjectSpawnAddon> {
  readonly INVISIBILITY_TYPE = INVISIBILITY_TYPE;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: GameobjectSpawnAddonService, public handlerService: GameobjectHandlerService) {
    super(editorService, handlerService);
  }
}

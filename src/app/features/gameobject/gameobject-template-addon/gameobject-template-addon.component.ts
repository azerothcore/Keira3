import { Component } from '@angular/core';
import { SingleRowEditorComponent } from '@keira-abstract/components/editors/single-row-editor.component';
import { GAMEOBJECT_FLAGS } from '@keira-constants/flags/gameobject-flags';
import { GameobjectTemplateAddon } from '@keira-types/gameobject-template-addon.type';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GameobjectTemplateAddonService } from './gameobject-template-addon.service';

@Component({
  selector: 'keira-gameobject-template-addon',
  templateUrl: './gameobject-template-addon.component.html',
  styleUrls: ['./gameobject-template-addon.component.scss'],
})
export class GameobjectTemplateAddonComponent extends SingleRowEditorComponent<GameobjectTemplateAddon> {
  public readonly GAMEOBJECT_FLAGS = GAMEOBJECT_FLAGS;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: GameobjectTemplateAddonService, public handlerService: GameobjectHandlerService) {
    super(editorService, handlerService);
  }
}

import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../../shared/abstract/components/editors/single-row-editor.component';
import { GameobjectTemplateAddon } from '../../../shared/types/gameobject-template-addon.type';
import { GameobjectTemplateAddonService } from '../gameobject-template-addon.service';
import { GameobjectHandlerService } from '../gameobject-handler.service';
import { GAMEOBJECT_FLAGS } from '../../../shared/constants/flags/gameobject-flags';
import { FACTIONS } from '../../../shared/constants/options/faction';

@Component({
  selector: 'app-gameobject-template-addon',
  templateUrl: './gameobject-template-addon.component.html',
  styleUrls: ['./gameobject-template-addon.component.scss']
})
export class GameobjectTemplateAddonComponent extends SingleRowEditorComponent<GameobjectTemplateAddon> {

  public readonly GAMEOBJECT_FLAGS = GAMEOBJECT_FLAGS;
  public readonly FACTIONS = FACTIONS;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: GameobjectTemplateAddonService,
    public handlerService: GameobjectHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

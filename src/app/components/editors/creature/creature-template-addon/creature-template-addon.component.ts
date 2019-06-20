import { Component } from '@angular/core';

import { SingleRowEditorComponent } from '../../shared/single-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { CreatureTemplateAddon } from '../../../../types/creature-template-addon.type';
import { CreatureTemplateAddonService } from '../../../../services/editors/creature/creature-template-addon.service';
import { EMOTE } from '../../../../constants/options/emote';

@Component({
  selector: 'app-creature-template-addon',
  templateUrl: './creature-template-addon.component.html',
  styleUrls: ['./creature-template-addon.component.scss']
})
export class CreatureTemplateAddonComponent extends SingleRowEditorComponent<CreatureTemplateAddon> {

  public readonly EMOTE = EMOTE;

  constructor(
    public editorService: CreatureTemplateAddonService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

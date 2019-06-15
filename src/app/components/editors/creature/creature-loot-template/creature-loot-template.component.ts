import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { CreatureLootTemplate } from './creature-loot-template.type';
import { CreatureLootTemplateService } from '../../../../services/editors/creature/creature-loot-template.service';

@Component({
  selector: 'app-creature-loot-template',
  templateUrl: '../../shared/loot-template/loot-template.component.html',
  styleUrls: ['../../shared/loot-template/loot-template.component.scss']
})
export class CreatureLootTemplateComponent extends MultiRowEditorComponent<CreatureLootTemplate> {

  constructor(
    public editorService: CreatureLootTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { SkinningLootTemplate } from './skinning-loot-template.type';
import { SkinningLootTemplateService } from '../../../../services/editors/creature/skinning-loot-template.service';

@Component({
  selector: 'app-skinning-loot-template',
  templateUrl: '../../shared/loot-template/loot-template.component.html',
  styleUrls: ['../../shared/loot-template/loot-template.component.scss']
})
export class SkinningLootTemplateComponent extends MultiRowEditorComponent<SkinningLootTemplate> {

  constructor(
    public editorService: SkinningLootTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}


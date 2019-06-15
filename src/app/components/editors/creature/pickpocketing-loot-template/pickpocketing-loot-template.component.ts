import { Component } from '@angular/core';

import { MultiRowEditorComponent } from '../../shared/multi-row-editor.component';
import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { PickpocketingLootTemplate } from './pickpocketing-loot-template.type';
import { PickpocketingLootTemplateService } from '../../../../services/editors/creature/pickpocketing-loot-template.service';

@Component({
  selector: 'app-pickpocketing-loot-template',
  templateUrl: '../../shared/loot-template/loot-template.component.html',
  styleUrls: ['../../shared/loot-template/loot-template.component.scss']
})
export class PickpocketingLootTemplateComponent extends MultiRowEditorComponent<PickpocketingLootTemplate> {

  constructor(
    public editorService: PickpocketingLootTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}


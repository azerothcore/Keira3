import { Component } from '@angular/core';

import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { PickpocketingLootTemplate } from '../../../../types/pickpocketing-loot-template.type';
import { PickpocketingLootTemplateService } from '../../../../services/editors/creature/pickpocketing-loot-template.service';
import { LootTemplateComponent } from '../../shared/loot-template/loot-template.component';

@Component({
  selector: 'app-pickpocketing-loot-template',
  templateUrl: '../../shared/loot-template/loot-template.component.html',
  styleUrls: ['../../shared/loot-template/loot-template.component.scss']
})
export class PickpocketingLootTemplateComponent extends LootTemplateComponent<PickpocketingLootTemplate> {

  constructor(
    public editorService: PickpocketingLootTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}


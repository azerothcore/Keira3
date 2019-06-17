import { Component } from '@angular/core';

import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { SkinningLootTemplate } from '../../../../types/skinning-loot-template.type';
import { SkinningLootTemplateService } from '../../../../services/editors/creature/skinning-loot-template.service';
import { LootTemplateComponent } from '../../shared/loot-template/loot-template.component';

@Component({
  selector: 'app-skinning-loot-template',
  templateUrl: '../../shared/loot-template/loot-template.component.html',
  styleUrls: ['../../shared/loot-template/loot-template.component.scss']
})
export class SkinningLootTemplateComponent extends LootTemplateComponent<SkinningLootTemplate> {

  constructor(
    public editorService: SkinningLootTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}


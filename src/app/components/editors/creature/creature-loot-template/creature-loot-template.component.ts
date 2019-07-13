import { Component } from '@angular/core';

import { CreatureHandlerService } from '../../../../services/handlers/creature-handler.service';
import { CreatureLootTemplate } from '../../../../types/creature-loot-template.type';
import { CreatureLootTemplateService } from '../../../../services/editors/creature/creature-loot-template.service';
import { LootTemplateComponent } from '../../shared/loot-template/loot-template.component';

@Component({
  selector: 'app-creature-loot-template',
  templateUrl: '../../shared/loot-template/loot-template.component.html',
  styleUrls: ['../../shared/loot-template/loot-template.component.scss']
})
export class CreatureLootTemplateComponent extends LootTemplateComponent<CreatureLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureLootTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

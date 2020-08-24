import { Component } from '@angular/core';

import { CreatureHandlerService } from '../creature-handler.service';
import { CreatureLootTemplate } from '@keira-types/creature-loot-template.type';
import { CreatureLootTemplateService } from './creature-loot-template.service';
import { LootTemplateIdComponent } from '@keira-abstract/components/editors/loot-template/loot-template-id.component';

@Component({
  selector: 'keira-creature-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template-id.component.html',
})
export class CreatureLootTemplateComponent extends LootTemplateIdComponent<CreatureLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: CreatureLootTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

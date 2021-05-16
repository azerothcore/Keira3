import { Component } from '@angular/core';

import { CreatureHandlerService } from '../creature-handler.service';
import { PickpocketingLootTemplate } from '@keira-types/pickpocketing-loot-template.type';
import { PickpocketingLootTemplateService } from './pickpocketing-loot-template.service';
import { LootTemplateIdComponent } from '@keira-abstract/components/editors/loot-template/loot-template-id.component';

@Component({
  selector: 'keira-pickpocketing-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template-id.component.html',
})
export class PickpocketingLootTemplateComponent extends LootTemplateIdComponent<PickpocketingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: PickpocketingLootTemplateService, public handlerService: CreatureHandlerService) {
    super(editorService, handlerService);
  }
}

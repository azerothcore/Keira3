import { Component } from '@angular/core';

import { CreatureHandlerService } from '../creature-handler.service';
import { PickpocketingLootTemplate } from '@keira-types/pickpocketing-loot-template.type';
import { PickpocketingLootTemplateService } from './pickpocketing-loot-template.service';
import { LootTemplateComponent } from '@keira-shared/abstract/components/editors/loot-template/loot-template.component';

@Component({
  selector: 'app-pickpocketing-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template.component.html',
  styleUrls: ['../../../shared/abstract/components/editors/loot-template/loot-template.component.scss']
})
export class PickpocketingLootTemplateComponent extends LootTemplateComponent<PickpocketingLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: PickpocketingLootTemplateService,
    public handlerService: CreatureHandlerService,
  ) {
    super(editorService, handlerService);
  }
}


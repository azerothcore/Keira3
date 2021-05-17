import { Component } from '@angular/core';

import { ItemHandlerService } from '../item-handler.service';
import { ProspectingLootTemplate } from '@keira-types/prospecting-loot-template.type';
import { ProspectingLootTemplateService } from './prospecting-loot-template.service';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';

@Component({
  selector: 'keira-prospecting-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template.component.html',
})
export class ProspectingLootTemplateComponent extends LootTemplateComponent<ProspectingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: ProspectingLootTemplateService, public handlerService: ItemHandlerService) {
    super(editorService, handlerService);
  }
}

import { Component } from '@angular/core';

import { FishingLootTemplate } from '@keira-types/fishing-loot-template.type';
import { FishingLootTemplateService } from './fishing-loot-template.service';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';
import { FishingLootHandlerService } from './fishing-loot-handler.service';

@Component({
  selector: 'keira-fishing-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template.component.html',
})
export class FishingLootTemplateComponent extends LootTemplateComponent<FishingLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: FishingLootTemplateService,
    public handlerService: FishingLootHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

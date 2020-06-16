import { Component } from '@angular/core';

import { ItemHandlerService } from '../item-handler.service';
import { MillingLootTemplate } from '@keira-types/milling-loot-template.type';
import { MillingLootTemplateService } from './milling-loot-template.service';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';

@Component({
  selector: 'keira-milling-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template.component.html',
})
export class MillingLootTemplateComponent extends LootTemplateComponent<MillingLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: MillingLootTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

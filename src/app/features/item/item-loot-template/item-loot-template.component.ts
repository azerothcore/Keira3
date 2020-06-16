import { Component } from '@angular/core';

import { ItemHandlerService } from '../item-handler.service';
import { ItemLootTemplate } from '@keira-types/item-loot-template.type';
import { ItemLootTemplateService } from './item-loot-template.service';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';

@Component({
  selector: 'keira-item-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template.component.html',
})
export class ItemLootTemplateComponent extends LootTemplateComponent<ItemLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ItemLootTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

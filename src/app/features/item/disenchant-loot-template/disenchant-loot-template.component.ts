import { Component } from '@angular/core';

import { ItemHandlerService } from '../item-handler.service';
import { DisenchantLootTemplate } from '@keira-types/disenchant-loot-template.type';
import { DisenchantLootTemplateService } from './disenchant-loot-template.service';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';

@Component({
  selector: 'app-disenchant-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template.component.html',
  styleUrls: ['../../../shared/abstract/components/editors/loot-template/loot-template.component.scss']
})
export class DisenchantLootTemplateComponent extends LootTemplateComponent<DisenchantLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: DisenchantLootTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

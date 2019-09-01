import { Component } from '@angular/core';

import { ItemHandlerService } from '../../../../services/handlers/item-handler.service';
import { DisenchantLootTemplate } from '../../../../types/disenchant-loot-template.type';
import { DisenchantLootTemplateService } from '../../../../services/editors/item/disenchant-loot-template.service';
import { LootTemplateComponent } from '../../shared/loot-template/loot-template.component';

@Component({
  selector: 'app-disenchant-loot-template',
  templateUrl: '../../shared/loot-template/loot-template.component.html',
  styleUrls: ['../../shared/loot-template/loot-template.component.scss']
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

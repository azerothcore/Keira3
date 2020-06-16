import { Component } from '@angular/core';

import { ItemHandlerService } from '../item-handler.service';
import { ReferenceLootTemplate } from '@keira-types/reference-loot-template.type';
import { ReferenceLootTemplateService } from './reference-loot-template.service';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';

@Component({
  selector: 'keira-reference-loot-template',
  templateUrl: '../item-loot-template/item-loot-template.component.html',
  styleUrls: ['../item-loot-template/item-loot-template.component.scss']
})
export class ReferenceLootTemplateComponent extends LootTemplateComponent<ReferenceLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ReferenceLootTemplateService,
    public handlerService: ItemHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

import { Component } from '@angular/core';

import { ReferenceLootTemplate } from '@keira-types/reference-loot-template.type';
import { ReferenceLootTemplateService } from './reference-loot-template.service';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';

@Component({
  selector: 'keira-reference-loot-template',
  templateUrl: '../item-loot-template/item-loot-template.component.html',
})
export class ReferenceLootTemplateComponent extends LootTemplateComponent<ReferenceLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: ReferenceLootTemplateService,
    public handlerService: ReferenceLootHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

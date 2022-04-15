import { Component } from '@angular/core';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';
import { ReferenceLootTemplate } from '@keira-types/reference-loot-template.type';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { ReferenceLootTemplateService } from './reference-loot-template.service';

@Component({
  selector: 'keira-reference-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template.component.html',
})
export class ReferenceLootTemplateComponent extends LootTemplateComponent<ReferenceLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public editorService: ReferenceLootTemplateService, public handlerService: ReferenceLootHandlerService) {
    super(editorService, handlerService);
  }
}

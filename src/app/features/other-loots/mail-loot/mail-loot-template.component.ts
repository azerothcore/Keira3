import { Component } from '@angular/core';

import { MailLootTemplate } from '@keira-types/mail-loot-template.type';
import { MailLootTemplateService } from './mail-loot-template.service';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';
import { MailLootHandlerService } from './mail-loot-handler.service';

@Component({
  selector: 'keira-mail-loot-template',
  templateUrl: '../../../shared/abstract/components/editors/loot-template/loot-template.component.html',
})
export class MailLootTemplateComponent extends LootTemplateComponent<MailLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public editorService: MailLootTemplateService,
    public handlerService: MailLootHandlerService,
  ) {
    super(editorService, handlerService);
  }
}

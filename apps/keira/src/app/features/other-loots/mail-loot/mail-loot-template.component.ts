import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LootTemplateComponent } from '@keira-abstract/components/editors/loot-template/loot-template.component';
import { MailLootTemplate } from '@keira-types/mail-loot-template.type';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { MailLootTemplateService } from './mail-loot-template.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

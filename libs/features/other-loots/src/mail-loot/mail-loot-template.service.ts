import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, MAIL_LOOT_TEMPLATE_TABLE, MailLootTemplate } from '@keira/shared/acore-world-model';
import { MailLootHandlerService } from './mail-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class MailLootTemplateService extends MultiRowEditorService<MailLootTemplate> {
  protected override readonly handlerService: MailLootHandlerService;

  constructor() {
    const handlerService = inject(MailLootHandlerService);

    super(MailLootTemplate, MAIL_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, handlerService);

    this.handlerService = handlerService;
  }
}

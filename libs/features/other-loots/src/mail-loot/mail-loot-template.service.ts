import { Injectable } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, MAIL_LOOT_TEMPLATE_TABLE, MailLootTemplate } from '@keira/shared/acore-world-model';
import { MailLootHandlerService } from './mail-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class MailLootTemplateService extends MultiRowEditorService<MailLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected handlerService: MailLootHandlerService) {
    super(MailLootTemplate, MAIL_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, handlerService);
  }
}

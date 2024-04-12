import { Injectable } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { MAIL_LOOT_TEMPLATE_TABLE, MailLootTemplate } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class MailLootHandlerService extends HandlerService<MailLootTemplate> {
  protected readonly mainEditorRoutePath = 'other-loots/mail';

  get isUnsaved(): boolean {
    return this.statusMap[MAIL_LOOT_TEMPLATE_TABLE];
  }

  protected _statusMap = {
    [MAIL_LOOT_TEMPLATE_TABLE]: false,
  };
}

import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { MAIL_LOOT_TEMPLATE_TABLE, MailLootTemplate } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class MailLootHandlerService extends HandlerService<MailLootTemplate> {
  protected readonly mainEditorRoutePath = 'other-loots/mail';

  get isUnsaved(): Signal<boolean> {
    return this.statusMap[MAIL_LOOT_TEMPLATE_TABLE].asReadonly();
  }

  protected _statusMap = {
    [MAIL_LOOT_TEMPLATE_TABLE]: signal(false),
  };
}

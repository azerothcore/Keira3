import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { MAIL_LOOT_TEMPLATE_TABLE, MailLootTemplate } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class MailLootHandlerService extends HandlerService<MailLootTemplate> {
  protected readonly mainEditorRoutePath = 'other-loots/mail';
  protected readonly copyRoutePath = 'other-loots/mail-copy';

  get isUnsaved(): Signal<boolean> {
    return this.statusMap[MAIL_LOOT_TEMPLATE_TABLE].asReadonly();
  }

  protected _statusMap = {
    [MAIL_LOOT_TEMPLATE_TABLE]: signal(false),
  };

  override select(isNew: boolean, id: string | number | Partial<MailLootTemplate>, name?: string, navigate = true, sourceId?: string) {
    if (isNew && sourceId) {
      super.select(isNew, id, name, false, sourceId);
      this.router.navigate([this.copyRoutePath]);
    } else {
      super.select(isNew, id, name, navigate);
    }
  }
}

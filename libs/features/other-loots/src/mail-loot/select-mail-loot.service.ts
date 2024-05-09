import { inject, Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { LOOT_TEMPLATE_ID, MAIL_LOOT_TEMPLATE_TABLE, MailLootTemplate } from '@keira/shared/acore-world-model';
import { MailLootHandlerService } from './mail-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectMailLootService extends SelectService<MailLootTemplate> {
  public readonly handlerService = inject(MailLootHandlerService);
  protected readonly entityTable = MAIL_LOOT_TEMPLATE_TABLE;
  protected readonly entityIdField = LOOT_TEMPLATE_ID;
  protected readonly entityNameField = null;
  protected readonly fieldList = [LOOT_TEMPLATE_ID];
  protected readonly selectFields = [LOOT_TEMPLATE_ID];
  protected readonly groupFields = [LOOT_TEMPLATE_ID];
}

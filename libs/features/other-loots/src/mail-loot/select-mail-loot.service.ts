import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { LOOT_TEMPLATE_ID, MAIL_LOOT_TEMPLATE_TABLE, MailLootTemplate } from '@keira/shared/acore-world-model';
import { MailLootHandlerService } from './mail-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectMailLootService extends SelectService<MailLootTemplate> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(MailLootHandlerService);
  protected readonly entityTable = MAIL_LOOT_TEMPLATE_TABLE;
  protected readonly entityIdField = LOOT_TEMPLATE_ID;
  protected entityNameField = null;
  protected readonly fieldList = [LOOT_TEMPLATE_ID];
  protected readonly selectFields = [LOOT_TEMPLATE_ID];
  protected readonly groupFields = [LOOT_TEMPLATE_ID];
  private readonly init = this.init();
}

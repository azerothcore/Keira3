import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { LOOT_TEMPLATE_ID, MAIL_LOOT_TEMPLATE_TABLE, MailLootTemplate } from '@keira/shared/acore-world-model';
import { MailLootHandlerService } from './mail-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectMailLootService extends SelectService<MailLootTemplate> {
  override readonly queryService: MysqlQueryService;
  override readonly handlerService: MailLootHandlerService;

  constructor() {
    const queryService = inject(MysqlQueryService);
    const handlerService = inject(MailLootHandlerService);

    super(
      queryService,
      handlerService,
      MAIL_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      null,
      [LOOT_TEMPLATE_ID],
      [LOOT_TEMPLATE_ID],
      [LOOT_TEMPLATE_ID],
    );

    this.queryService = queryService;
    this.handlerService = handlerService;
  }
}

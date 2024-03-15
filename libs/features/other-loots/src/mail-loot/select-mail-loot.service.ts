import { Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { LOOT_TEMPLATE_ID, MAIL_LOOT_TEMPLATE_TABLE, MailLootTemplate } from '@keira/shared/acore-world-model';
import { MailLootHandlerService } from './mail-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectMailLootService extends SelectService<MailLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    readonly queryService: MysqlQueryService,
    public handlerService: MailLootHandlerService,
  ) {
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
  }
}

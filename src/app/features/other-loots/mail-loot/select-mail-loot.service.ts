import { Injectable } from '@angular/core';

import { SelectService } from '@keira-abstract/service/select/select.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MAIL_LOOT_TEMPLATE_TABLE, MailLootTemplate } from '@keira-types/mail-loot-template.type';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { LOOT_TEMPLATE_ID } from '@keira-types/loot-template.type';

@Injectable()
export class SelectMailLootService extends SelectService<MailLootTemplate> {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public readonly queryService: MysqlQueryService,
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

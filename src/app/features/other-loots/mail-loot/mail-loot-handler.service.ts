import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { HandlerService } from '@keira-abstract/service/handlers/handler.service';
import { MAIL_LOOT_TEMPLATE_TABLE, MailLootTemplate } from '@keira-types/mail-loot-template.type';

@Injectable()
export class MailLootHandlerService extends HandlerService<MailLootTemplate> {

  get isUnsaved(): boolean { return this.statusMap[MAIL_LOOT_TEMPLATE_TABLE]; }

  protected _statusMap = {
    [MAIL_LOOT_TEMPLATE_TABLE]: false,
  };

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected router: Router,
  ) {
    super(
      'other-loots/mail',
      router,
    );
  }
}

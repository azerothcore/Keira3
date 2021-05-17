import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { MultiRowEditorService } from '@keira-abstract/service/editors/multi-row-editor.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { MAIL_LOOT_TEMPLATE_TABLE, MailLootTemplate } from '@keira-types/mail-loot-template.type';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2 } from '@keira-types/loot-template.type';
import { MailLootHandlerService } from './mail-loot-handler.service';

@Injectable()
export class MailLootTemplateService extends MultiRowEditorService<MailLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: MailLootHandlerService,
    public readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(
      MailLootTemplate,
      MAIL_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      LOOT_TEMPLATE_ID_2,
      handlerService,
      queryService,
      toastrService,
    );
  }
}

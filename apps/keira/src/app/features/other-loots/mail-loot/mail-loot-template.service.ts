import { Injectable } from '@angular/core';
import { MultiRowEditorService, MysqlQueryService } from '@keira/core';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, MAIL_LOOT_TEMPLATE_TABLE, MailLootTemplate } from '@keira/acore-world-model';
import { ToastrService } from 'ngx-toastr';
import { MailLootHandlerService } from './mail-loot-handler.service';

@Injectable()
export class MailLootTemplateService extends MultiRowEditorService<MailLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected handlerService: MailLootHandlerService,
    readonly queryService: MysqlQueryService,
    protected toastrService: ToastrService,
  ) {
    super(MailLootTemplate, MAIL_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, handlerService, queryService, toastrService);
  }
}

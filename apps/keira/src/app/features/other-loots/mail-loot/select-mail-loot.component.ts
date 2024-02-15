import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@keira-abstract/components/editors/select.component';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { LOOT_TEMPLATE_ID } from '@keira-types/loot-template.type';
import { MailLootTemplate, MAIL_LOOT_TEMPLATE_CUSTOM_STARTING_ID, MAIL_LOOT_TEMPLATE_TABLE } from '@keira-types/mail-loot-template.type';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { SelectMailLootService } from './select-mail-loot.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-creature',
  templateUrl: '../select-loot.component.html',
})
export class SelectMailLootComponent extends SelectComponent<MailLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectMailLootService,
    public handlerService: MailLootHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(MAIL_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, MAIL_LOOT_TEMPLATE_CUSTOM_STARTING_ID, selectService, handlerService, queryService);
  }
}

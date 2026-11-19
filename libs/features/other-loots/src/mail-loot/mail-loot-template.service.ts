import { Service, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  LOOT_TEMPLATE_ID,
  LOOT_TEMPLATE_ID_2,
  LOOT_TEMPLATE_ID_3,
  MAIL_LOOT_TEMPLATE_TABLE,
  MailLootTemplate,
} from '@keira/shared/acore-world-model';
import { MailLootHandlerService } from './mail-loot-handler.service';

@Service()
export class MailLootTemplateService extends MultiRowEditorService<MailLootTemplate> {
  protected override readonly handlerService = inject(MailLootHandlerService);
  protected override readonly _entityClass = MailLootTemplate;
  protected override readonly _entityTable = MAIL_LOOT_TEMPLATE_TABLE;
  protected override readonly _entityIdField = LOOT_TEMPLATE_ID;
  protected override readonly _entitySecondIdField = LOOT_TEMPLATE_ID_2;
  protected override readonly _entityExtraIdField = LOOT_TEMPLATE_ID_3;

  constructor() {
    super();
    this.init();
  }
}

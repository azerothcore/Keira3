import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { MAIL_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-mail-loot-copy',
  template: `<keira-copy-output
    [handlerService]="handlerService"
    selectRoute="other-loots/select-mail"
    [tableName]="tableName"
    [idField]="idField"
    [relatedTables]="relatedTables"
  />`,
  imports: [CopyOutputComponent],
})
export class MailLootCopyComponent {
  protected readonly handlerService = inject(MailLootHandlerService);

  protected readonly tableName = MAIL_LOOT_TEMPLATE_TABLE;
  protected readonly idField = LOOT_TEMPLATE_ID;

  protected readonly relatedTables: Array<{ tableName: string; idField: string }> = [];
}

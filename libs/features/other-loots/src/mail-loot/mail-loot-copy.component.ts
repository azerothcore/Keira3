import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { MailLootHandlerService } from './mail-loot-handler.service';
import { Router } from '@angular/router';
import { MAIL_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-mail-loot-copy',
  templateUrl: './mail-loot-copy.component.html',
  imports: [CopyOutputComponent],
})
export class MailLootCopyComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly handlerService = inject(MailLootHandlerService);

  protected readonly tableName = MAIL_LOOT_TEMPLATE_TABLE;
  protected readonly idField = LOOT_TEMPLATE_ID;
  protected sourceId!: string | number;
  protected newId!: string | number;

  protected readonly relatedTables: Array<{ tableName: string; idField: string }> = [];

  ngOnInit(): void {
    if (!this.handlerService.sourceId || !this.handlerService.selected) {
      this.router.navigate(['/other-loots/select-mail']);
      return;
    }

    this.sourceId = this.handlerService.sourceId;
    this.newId = this.handlerService.selected;
  }
}

import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { NpcTextHandlerService } from './npc-text-handler.service';
import { Router } from '@angular/router';
import { NPC_TEXT_TABLE, NPC_TEXT_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-npc-text-copy',
  templateUrl: './npc-text-copy.component.html',

  imports: [CopyOutputComponent],
})
export class NpcTextCopyComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly handlerService = inject(NpcTextHandlerService);

  protected readonly tableName = NPC_TEXT_TABLE;
  protected readonly idField = NPC_TEXT_ID;
  protected sourceId!: string | number;
  protected newId!: string | number;

  protected readonly relatedTables: Array<{ tableName: string; idField: string }> = [];

  ngOnInit(): void {
    if (!this.handlerService.sourceId || !this.handlerService.selected) {
      this.router.navigate(['/texts/select-npc-text']);
      return;
    }

    this.sourceId = this.handlerService.sourceId;
    this.newId = this.handlerService.selected;
  }
}

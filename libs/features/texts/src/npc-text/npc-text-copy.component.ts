import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { NpcTextHandlerService } from './npc-text-handler.service';
import { NPC_TEXT_TABLE, NPC_TEXT_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-npc-text-copy',
  template: `<keira-copy-output
    [handlerService]="handlerService"
    selectRoute="texts/select-npc-text"
    [tableName]="tableName"
    [idField]="idField"
    [relatedTables]="relatedTables"
  />`,
  imports: [CopyOutputComponent],
})
export class NpcTextCopyComponent {
  protected readonly handlerService = inject(NpcTextHandlerService);

  protected readonly tableName = NPC_TEXT_TABLE;
  protected readonly idField = NPC_TEXT_ID;

  protected readonly relatedTables: Array<{ tableName: string; idField: string }> = [];
}

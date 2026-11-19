import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';
import { REFERENCE_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-reference-loot-copy',
  template: `<keira-copy-output
    [handlerService]="handlerService"
    selectRoute="other-loots/select-reference"
    [tableName]="tableName"
    [idField]="idField"
    [relatedTables]="relatedTables"
  />`,
  imports: [CopyOutputComponent],
})
export class ReferenceLootCopyComponent {
  protected readonly handlerService = inject(ReferenceLootHandlerService);

  protected readonly tableName = REFERENCE_LOOT_TEMPLATE_TABLE;
  protected readonly idField = LOOT_TEMPLATE_ID;

  protected readonly relatedTables: Array<{ tableName: string; idField: string }> = [];
}

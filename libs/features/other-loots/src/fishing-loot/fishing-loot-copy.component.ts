import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { FishingLootHandlerService } from './fishing-loot-handler.service';
import { FISHING_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-fishing-loot-copy',
  template: `<keira-copy-output
    [handlerService]="handlerService"
    selectRoute="other-loots/select-fishing"
    [tableName]="tableName"
    [idField]="idField"
    [relatedTables]="relatedTables"
  />`,
  imports: [CopyOutputComponent],
})
export class FishingLootCopyComponent {
  protected readonly handlerService = inject(FishingLootHandlerService);

  protected readonly tableName = FISHING_LOOT_TEMPLATE_TABLE;
  protected readonly idField = LOOT_TEMPLATE_ID;

  protected readonly relatedTables: Array<{ tableName: string; idField: string }> = [];
}

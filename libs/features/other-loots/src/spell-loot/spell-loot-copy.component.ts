import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { SpellLootHandlerService } from './spell-loot-handler.service';
import { SPELL_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-loot-copy',
  template: `<keira-copy-output
    [handlerService]="handlerService"
    selectRoute="other-loots/select-spell"
    [tableName]="tableName"
    [idField]="idField"
    [relatedTables]="relatedTables"
  />`,
  imports: [CopyOutputComponent],
})
export class SpellLootCopyComponent {
  protected readonly handlerService = inject(SpellLootHandlerService);

  protected readonly tableName = SPELL_LOOT_TEMPLATE_TABLE;
  protected readonly idField = LOOT_TEMPLATE_ID;

  protected readonly relatedTables: Array<{ tableName: string; idField: string }> = [];
}

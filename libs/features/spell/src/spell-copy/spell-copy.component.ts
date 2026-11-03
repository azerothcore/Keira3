import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { SpellHandlerService } from '../spell-handler.service';
import { SPELL_DBC_TABLE, SPELL_DBC_ID, SPELL_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID } from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-copy',
  template: `<keira-copy-output
    [handlerService]="handlerService"
    selectRoute="spell/select"
    [tableName]="tableName"
    [idField]="idField"
    [relatedTables]="relatedTables"
  />`,
  imports: [CopyOutputComponent],
})
export class SpellCopyComponent {
  protected readonly handlerService = inject(SpellHandlerService);

  protected readonly tableName = SPELL_DBC_TABLE;
  protected readonly idField = SPELL_DBC_ID;

  protected readonly relatedTables = [{ tableName: SPELL_LOOT_TEMPLATE_TABLE, idField: LOOT_TEMPLATE_ID }];
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { ItemHandlerService } from '../item-handler.service';
import {
  ITEM_TEMPLATE_TABLE,
  ITEM_TEMPLATE_ID,
  ITEM_LOOT_TEMPLATE_TABLE,
  PROSPECTING_LOOT_TEMPLATE_TABLE,
  MILLING_LOOT_TEMPLATE_TABLE,
  LOOT_TEMPLATE_ID,
  ITEM_TEMPLATE_LOCALE_TABLE,
  ITEM_TEMPLATE_LOCALE_ID,
} from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-copy',
  template: `<keira-copy-output
    [handlerService]="handlerService"
    selectRoute="item/select"
    [tableName]="tableName"
    [idField]="idField"
    [relatedTables]="relatedTables"
  />`,
  imports: [CopyOutputComponent],
})
export class ItemCopyComponent {
  protected readonly handlerService = inject(ItemHandlerService);

  protected readonly tableName = ITEM_TEMPLATE_TABLE;
  protected readonly idField = ITEM_TEMPLATE_ID;

  protected readonly relatedTables = [
    { tableName: ITEM_TEMPLATE_LOCALE_TABLE, idField: ITEM_TEMPLATE_LOCALE_ID },
    // (not item_enchantment_template nor the disenchant loot: they're found by the template's RandomProperty/RandomSuffix
    // and DisenchantID, copied with it, and shared with other items)
    { tableName: ITEM_LOOT_TEMPLATE_TABLE, idField: LOOT_TEMPLATE_ID },
    { tableName: PROSPECTING_LOOT_TEMPLATE_TABLE, idField: LOOT_TEMPLATE_ID },
    { tableName: MILLING_LOOT_TEMPLATE_TABLE, idField: LOOT_TEMPLATE_ID },
  ];
}

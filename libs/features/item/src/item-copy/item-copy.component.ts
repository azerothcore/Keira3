import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CopyOutputComponent } from '@keira/shared/base-editor-components';
import { ItemHandlerService } from '../item-handler.service';
import { Router } from '@angular/router';
import {
  ITEM_TEMPLATE_TABLE,
  ITEM_TEMPLATE_ID,
  ITEM_ENCHANTMENT_TEMPLATE_TABLE,
  ITEM_ENCHANTMENT_TEMPLATE_ID,
  ITEM_LOOT_TEMPLATE_TABLE,
  DISENCHANT_LOOT_TEMPLATE_TABLE,
  PROSPECTING_LOOT_TEMPLATE_TABLE,
  MILLING_LOOT_TEMPLATE_TABLE,
  LOOT_TEMPLATE_ID,
} from '@keira/shared/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-copy',
  templateUrl: './item-copy.component.html',
  imports: [CopyOutputComponent],
})
export class ItemCopyComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly handlerService = inject(ItemHandlerService);

  protected readonly tableName = ITEM_TEMPLATE_TABLE;
  protected readonly idField = ITEM_TEMPLATE_ID;
  protected sourceId!: string | number;
  protected newId!: string | number;

  protected readonly relatedTables = [
    { tableName: ITEM_ENCHANTMENT_TEMPLATE_TABLE, idField: ITEM_ENCHANTMENT_TEMPLATE_ID },
    { tableName: ITEM_LOOT_TEMPLATE_TABLE, idField: LOOT_TEMPLATE_ID },
    { tableName: DISENCHANT_LOOT_TEMPLATE_TABLE, idField: LOOT_TEMPLATE_ID },
    { tableName: PROSPECTING_LOOT_TEMPLATE_TABLE, idField: LOOT_TEMPLATE_ID },
    { tableName: MILLING_LOOT_TEMPLATE_TABLE, idField: LOOT_TEMPLATE_ID },
  ];

  ngOnInit(): void {
    if (!this.handlerService.sourceId || !this.handlerService.selected) {
      this.router.navigate(['/item/select']);
      return;
    }

    this.sourceId = this.handlerService.sourceId;
    this.newId = this.handlerService.selected;
  }
}

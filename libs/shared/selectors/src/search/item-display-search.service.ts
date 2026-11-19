import { inject, Service } from '@angular/core';
import { ITEM_TEMPLATE_TABLE, ItemTemplate } from '@keira/shared/acore-world-model';
import { SearchService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';

/** The item displays used by the items (one row each): how many items use it, one of their names, and its slot. */
@Service()
export class ItemDisplaySearchService extends SearchService<ItemTemplate> {
  override readonly queryService = inject(MysqlQueryService);
  protected override readonly entityTable = ITEM_TEMPLATE_TABLE;
  protected override readonly fieldList = ['displayid', 'name', 'InventoryType', 'class', 'subclass'] as (keyof ItemTemplate & string)[];
  protected override readonly selectFields = [
    'displayid',
    '(COUNT(*)) AS `items`',
    '(MIN(`name`)) AS `name`',
    '(MIN(`InventoryType`)) AS `InventoryType`',
  ];
  protected override readonly groupFields = ['displayid'];

  constructor() {
    super();
    this.init();
  }
}

import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { FISHING_LOOT_TEMPLATE_TABLE, FishingLootTemplate, LOOT_TEMPLATE_ID } from '@keira/shared/acore-world-model';
import { FishingLootHandlerService } from './fishing-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectFishingLootService extends SelectService<FishingLootTemplate> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(FishingLootHandlerService);
  protected override readonly entityTable = FISHING_LOOT_TEMPLATE_TABLE;
  protected override readonly entityIdField = LOOT_TEMPLATE_ID;
  protected override entityNameField = null;
  protected override readonly fieldList = [LOOT_TEMPLATE_ID];
  protected override readonly selectFields = [LOOT_TEMPLATE_ID];
  protected override readonly groupFields = [LOOT_TEMPLATE_ID];
  constructor() {
    super();
    this.init();
  }
}

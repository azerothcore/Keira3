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
  protected readonly entityTable = FISHING_LOOT_TEMPLATE_TABLE;
  protected readonly entityIdField = LOOT_TEMPLATE_ID;
  protected entityNameField = null;
  protected readonly fieldList = [LOOT_TEMPLATE_ID];
  protected readonly selectFields = [LOOT_TEMPLATE_ID];
  protected readonly groupFields = [LOOT_TEMPLATE_ID];
  private readonly init = this.init();
}

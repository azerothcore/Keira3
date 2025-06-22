import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { FISHING_LOOT_TEMPLATE_TABLE, FishingLootTemplate, LOOT_TEMPLATE_ID } from '@keira/shared/acore-world-model';
import { FishingLootHandlerService } from './fishing-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectFishingLootService extends SelectService<FishingLootTemplate> {
  override readonly queryService: MysqlQueryService;
  override readonly handlerService: FishingLootHandlerService;

  constructor() {
    const queryService = inject(MysqlQueryService);
    const handlerService = inject(FishingLootHandlerService);

    super(
      queryService,
      handlerService,
      FISHING_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      null,
      [LOOT_TEMPLATE_ID],
      [LOOT_TEMPLATE_ID],
      [LOOT_TEMPLATE_ID],
    );

    this.queryService = queryService;
    this.handlerService = handlerService;
  }
}

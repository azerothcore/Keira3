import { Injectable } from '@angular/core';
import { MysqlQueryService, SelectService } from '@keira/core';
import { FISHING_LOOT_TEMPLATE_TABLE, FishingLootTemplate, LOOT_TEMPLATE_ID } from '@keira/acore-world-model';
import { FishingLootHandlerService } from './fishing-loot-handler.service';

@Injectable()
export class SelectFishingLootService extends SelectService<FishingLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    readonly queryService: MysqlQueryService,
    public handlerService: FishingLootHandlerService,
  ) {
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
  }
}

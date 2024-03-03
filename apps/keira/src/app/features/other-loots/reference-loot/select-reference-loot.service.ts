import { Injectable } from '@angular/core';
import { MysqlQueryService, SelectService } from '@keira/core';
import { LOOT_TEMPLATE_ID, REFERENCE_LOOT_TEMPLATE_TABLE, ReferenceLootTemplate } from '@keira/acore-world-model';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';

@Injectable()
export class SelectReferenceLootService extends SelectService<ReferenceLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    readonly queryService: MysqlQueryService,
    public handlerService: ReferenceLootHandlerService,
  ) {
    super(
      queryService,
      handlerService,
      REFERENCE_LOOT_TEMPLATE_TABLE,
      LOOT_TEMPLATE_ID,
      null,
      [LOOT_TEMPLATE_ID],
      [LOOT_TEMPLATE_ID],
      [LOOT_TEMPLATE_ID],
    );
  }
}

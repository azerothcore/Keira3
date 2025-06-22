import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { LOOT_TEMPLATE_ID, REFERENCE_LOOT_TEMPLATE_TABLE, ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectReferenceLootService extends SelectService<ReferenceLootTemplate> {
  override readonly queryService: MysqlQueryService;
  override readonly handlerService: ReferenceLootHandlerService;

  constructor() {
    const queryService = inject(MysqlQueryService);
    const handlerService = inject(ReferenceLootHandlerService);

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

    this.queryService = queryService;
    this.handlerService = handlerService;
  }
}

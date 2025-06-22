import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { LOOT_TEMPLATE_ID, REFERENCE_LOOT_TEMPLATE_TABLE, ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectReferenceLootService extends SelectService<ReferenceLootTemplate> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(ReferenceLootHandlerService);
  protected override readonly entityTable = REFERENCE_LOOT_TEMPLATE_TABLE;
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

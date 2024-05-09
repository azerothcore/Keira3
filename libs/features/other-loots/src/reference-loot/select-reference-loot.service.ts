import { inject, Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { LOOT_TEMPLATE_ID, REFERENCE_LOOT_TEMPLATE_TABLE, ReferenceLootTemplate } from '@keira/shared/acore-world-model';
import { ReferenceLootHandlerService } from './reference-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectReferenceLootService extends SelectService<ReferenceLootTemplate> {
  public readonly handlerService = inject(ReferenceLootHandlerService);
  protected readonly entityTable = REFERENCE_LOOT_TEMPLATE_TABLE;
  protected readonly entityIdField = LOOT_TEMPLATE_ID;
  protected readonly entityNameField = null;
  protected readonly fieldList = [LOOT_TEMPLATE_ID];
  protected readonly selectFields = [LOOT_TEMPLATE_ID];
  protected readonly groupFields = [LOOT_TEMPLATE_ID];
}

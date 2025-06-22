import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { LOOT_TEMPLATE_ID, SPELL_LOOT_TEMPLATE_TABLE, SpellLootTemplate } from '@keira/shared/acore-world-model';
import { SpellLootHandlerService } from './spell-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectSpellLootService extends SelectService<SpellLootTemplate> {
  override readonly queryService = inject(MysqlQueryService);
  override readonly handlerService = inject(SpellLootHandlerService);
  protected override readonly entityTable = SPELL_LOOT_TEMPLATE_TABLE;
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

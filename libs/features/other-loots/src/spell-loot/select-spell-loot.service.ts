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
  protected readonly entityTable = SPELL_LOOT_TEMPLATE_TABLE;
  protected readonly entityIdField = LOOT_TEMPLATE_ID;
  protected entityNameField = null;
  protected readonly fieldList = [LOOT_TEMPLATE_ID];
  protected readonly selectFields = [LOOT_TEMPLATE_ID];
  protected readonly groupFields = [LOOT_TEMPLATE_ID];
  private readonly init = this.init();
}

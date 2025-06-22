import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { LOOT_TEMPLATE_ID, SPELL_LOOT_TEMPLATE_TABLE, SpellLootTemplate } from '@keira/shared/acore-world-model';
import { SpellLootHandlerService } from './spell-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectSpellLootService extends SelectService<SpellLootTemplate> {
  override readonly queryService: MysqlQueryService;
  override readonly handlerService: SpellLootHandlerService;

  constructor() {
    const queryService = inject(MysqlQueryService);
    const handlerService = inject(SpellLootHandlerService);

    super(
      queryService,
      handlerService,
      SPELL_LOOT_TEMPLATE_TABLE,
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

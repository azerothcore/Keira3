import { Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/core';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { LOOT_TEMPLATE_ID, SPELL_LOOT_TEMPLATE_TABLE, SpellLootTemplate } from '@keira/shared/acore-world-model';
import { SpellLootHandlerService } from './spell-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectSpellLootService extends SelectService<SpellLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    readonly queryService: MysqlQueryService,
    public handlerService: SpellLootHandlerService,
  ) {
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
  }
}

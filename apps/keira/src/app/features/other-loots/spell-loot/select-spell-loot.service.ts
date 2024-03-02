import { Injectable } from '@angular/core';
import { SelectService } from '@keira-abstract/service/select/select.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { LOOT_TEMPLATE_ID } from '@keira/acore-world-model';
import { SpellLootTemplate, SPELL_LOOT_TEMPLATE_TABLE } from '@keira/acore-world-model';
import { SpellLootHandlerService } from './spell-loot-handler.service';

@Injectable()
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

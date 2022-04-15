import { Injectable } from '@angular/core';
import { SelectService } from '@keira-abstract/service/select/select.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { LOOT_TEMPLATE_ID } from '@keira-types/loot-template.type';
import { SpellLootTemplate, SPELL_LOOT_TEMPLATE_TABLE } from '@keira-types/spell-loot-template.type';
import { SpellLootHandlerService } from './spell-loot-handler.service';

@Injectable()
export class SelectSpellLootService extends SelectService<SpellLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(public readonly queryService: MysqlQueryService, public handlerService: SpellLootHandlerService) {
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

import { Component } from '@angular/core';

import { SelectComponent } from '@keira-abstract/components/editors/select.component';
import { SelectSpellLootService } from './select-spell-loot.service';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import {
  SPELL_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
  SPELL_LOOT_TEMPLATE_TABLE,
  SpellLootTemplate,
} from '@keira-types/spell-loot-template.type';
import { LOOT_TEMPLATE_ID } from '@keira-types/loot-template.type';
import { SpellLootHandlerService } from './spell-loot-handler.service';

@Component({
  selector: 'keira-select-creature',
  templateUrl: '../select-loot.component.html',
})
export class SelectSpellLootComponent extends SelectComponent<SpellLootTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectSpellLootService,
    public handlerService: SpellLootHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(SPELL_LOOT_TEMPLATE_TABLE, LOOT_TEMPLATE_ID, SPELL_LOOT_TEMPLATE_CUSTOM_STARTING_ID, selectService, handlerService, queryService);
  }
}

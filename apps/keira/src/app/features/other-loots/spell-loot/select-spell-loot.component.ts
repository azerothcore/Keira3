import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@keira-abstract/components/editors/select.component';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { LOOT_TEMPLATE_ID } from '@keira-types/loot-template.type';
import {
  SpellLootTemplate,
  SPELL_LOOT_TEMPLATE_CUSTOM_STARTING_ID,
  SPELL_LOOT_TEMPLATE_TABLE,
} from '@keira-types/spell-loot-template.type';
import { SelectSpellLootService } from './select-spell-loot.service';
import { SpellLootHandlerService } from './spell-loot-handler.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

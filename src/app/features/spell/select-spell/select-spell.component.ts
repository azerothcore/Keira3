import { Component } from '@angular/core';
import { SelectComponent } from '@keira-abstract/components/editors/select.component';
import {
  SPELL_DBC_CUSTOM_STARTING_ID,
  SPELL_DBC_ID, SPELL_DBC_NAME,
  SPELL_DBC_TABLE,
  SpellDbc,
} from '@keira-types/spell-dbc.type';
import { MysqlQueryService } from '@keira-shared/services/mysql-query.service';
import { SelectSpellService } from './select-spell.service';
import { SpellHandlerService } from '../spell-handler.service';

@Component({
  selector: 'keira-select-spell',
  templateUrl: './select-spell.component.html',
})
export class SelectSpellComponent extends SelectComponent<SpellDbc> {
  readonly SPELL_DBC_ID = SPELL_DBC_ID;
  readonly SPELL_DBC_NAME = SPELL_DBC_NAME;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectSpellService,
    public handlerService: SpellHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(
      SPELL_DBC_TABLE,
      SPELL_DBC_ID,
      SPELL_DBC_CUSTOM_STARTING_ID,
      selectService,
      handlerService,
      queryService,
    );
  }
}

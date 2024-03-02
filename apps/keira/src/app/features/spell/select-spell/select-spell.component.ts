import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SelectComponent } from '@keira-abstract/components/editors/select.component';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import {
  SpellDbc,
  SPELL_DBC_CUSTOM_STARTING_ID,
  SPELL_DBC_DESCRIPTION,
  SPELL_DBC_ID,
  SPELL_DBC_NAME,
  SPELL_DBC_NAMESUBTEXT,
  SPELL_DBC_TABLE,
} from '@keira/acore-world-model';
import { SpellHandlerService } from '../spell-handler.service';
import { SelectSpellService } from './select-spell.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-select-spell',
  templateUrl: './select-spell.component.html',
})
export class SelectSpellComponent extends SelectComponent<SpellDbc> {
  readonly SPELL_DBC_ID = SPELL_DBC_ID;
  readonly SPELL_DBC_NAME = SPELL_DBC_NAME;
  readonly SPELL_DBC_NAMESUBTEXT = SPELL_DBC_NAMESUBTEXT;
  readonly SPELL_DBC_DESCRIPTION = SPELL_DBC_DESCRIPTION;

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    public selectService: SelectSpellService,
    public handlerService: SpellHandlerService,
    public queryService: MysqlQueryService,
  ) {
    super(SPELL_DBC_TABLE, SPELL_DBC_ID, SPELL_DBC_CUSTOM_STARTING_ID, selectService, handlerService, queryService);
  }
}

import { Injectable } from '@angular/core';
import { MysqlQueryService, SelectService } from '@keira/shared/core';
import { SPELL_DBC_ID, SPELL_DBC_NAME, SPELL_DBC_SEARCH_FIELDS, SPELL_DBC_TABLE, SpellDbc } from '@keira/shared/acore-world-model';
import { SpellHandlerService } from '../spell-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectSpellService extends SelectService<SpellDbc> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    readonly queryService: MysqlQueryService,
    public handlerService: SpellHandlerService,
  ) {
    super(queryService, handlerService, SPELL_DBC_TABLE, SPELL_DBC_ID, SPELL_DBC_NAME, SPELL_DBC_SEARCH_FIELDS);
  }
}

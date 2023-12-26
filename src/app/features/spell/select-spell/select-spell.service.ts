import { Injectable } from '@angular/core';
import { SelectService } from '@keira-abstract/service/select/select.service';
import { MysqlQueryService } from '@keira-shared/services/query/mysql-query.service';
import { SpellDbc, SPELL_DBC_ID, SPELL_DBC_NAME, SPELL_DBC_SEARCH_FIELDS, SPELL_DBC_TABLE } from '@keira-types/spell-dbc.type';
import { SpellHandlerService } from '../spell-handler.service';

@Injectable()
export class SelectSpellService extends SelectService<SpellDbc> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(readonly queryService: MysqlQueryService, public handlerService: SpellHandlerService) {
    super(queryService, handlerService, SPELL_DBC_TABLE, SPELL_DBC_ID, SPELL_DBC_NAME, SPELL_DBC_SEARCH_FIELDS);
  }
}

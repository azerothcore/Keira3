import { Injectable, inject } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SPELL_DBC_ID, SPELL_DBC_NAME, SPELL_DBC_SEARCH_FIELDS, SPELL_DBC_TABLE, SpellDbc } from '@keira/shared/acore-world-model';
import { SpellHandlerService } from '../spell-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectSpellService extends SelectService<SpellDbc> {
  override readonly queryService: MysqlQueryService;
  override readonly handlerService: SpellHandlerService;

  constructor() {
    const queryService = inject(MysqlQueryService);
    const handlerService = inject(SpellHandlerService);

    super(queryService, handlerService, SPELL_DBC_TABLE, SPELL_DBC_ID, SPELL_DBC_NAME, SPELL_DBC_SEARCH_FIELDS);

    this.queryService = queryService;
    this.handlerService = handlerService;
  }
}

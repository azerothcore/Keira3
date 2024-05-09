import { inject, Injectable } from '@angular/core';
import { SelectService } from '@keira/shared/base-abstract-classes';
import { MysqlQueryService } from '@keira/shared/db-layer';
import { SPELL_DBC_ID, SPELL_DBC_NAME, SPELL_DBC_SEARCH_FIELDS, SPELL_DBC_TABLE, SpellDbc } from '@keira/shared/acore-world-model';
import { SpellHandlerService } from '../spell-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SelectSpellService extends SelectService<SpellDbc> {
  public readonly handlerService = inject(SpellHandlerService);
  protected readonly entityTable = SPELL_DBC_TABLE;
  protected readonly entityIdField = SPELL_DBC_ID;
  protected readonly entityNameField = SPELL_DBC_NAME;
  protected readonly fieldList = SPELL_DBC_SEARCH_FIELDS;
}

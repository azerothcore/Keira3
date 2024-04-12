import { Injectable } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { SPELL_DBC_ID, SPELL_DBC_NAME, SPELL_DBC_TABLE, SpellDbc } from '@keira/shared/acore-world-model';
import { SpellHandlerService } from '../spell-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SpellDbcService extends SingleRowEditorService<SpellDbc> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected handlerService: SpellHandlerService) {
    super(SpellDbc, SPELL_DBC_TABLE, SPELL_DBC_ID, SPELL_DBC_NAME, true, handlerService);
  }
}

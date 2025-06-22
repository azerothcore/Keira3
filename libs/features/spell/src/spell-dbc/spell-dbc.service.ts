import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { SPELL_DBC_ID, SPELL_DBC_NAME, SPELL_DBC_TABLE, SpellDbc } from '@keira/shared/acore-world-model';
import { SpellHandlerService } from '../spell-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SpellDbcService extends SingleRowEditorService<SpellDbc> {
  protected override readonly handlerService = inject(SpellHandlerService);

  constructor() {
    super(SpellDbc, SPELL_DBC_TABLE, SPELL_DBC_ID, SPELL_DBC_NAME, true);
  }
}

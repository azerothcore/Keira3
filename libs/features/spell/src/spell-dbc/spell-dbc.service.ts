import { Injectable, inject } from '@angular/core';
import { SingleRowEditorService } from '@keira/shared/base-abstract-classes';
import { SPELL_DBC_ID, SPELL_DBC_NAME, SPELL_DBC_TABLE, SpellDbc } from '@keira/shared/acore-world-model';
import { SpellHandlerService } from '../spell-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SpellDbcService extends SingleRowEditorService<SpellDbc> {
  protected override readonly handlerService = inject(SpellHandlerService);
  protected override _entityClass = SpellDbc;
  protected override _entityTable = SPELL_DBC_TABLE;
  protected override _entityIdField = SPELL_DBC_ID;
  protected override _entityNameField = SPELL_DBC_NAME;
  protected override isMainEntity = true;

  constructor() {
    super();
    this.init();
  }
}

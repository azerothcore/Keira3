import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { SPELL_DBC_TABLE, SpellDbc } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class SpellHandlerService extends HandlerService<SpellDbc> {
  protected readonly mainEditorRoutePath = 'spell/spell-dbc';

  get isSpellDbcUnsaved(): Signal<boolean> {
    return this.statusMap[SPELL_DBC_TABLE].asReadonly();
  }

  protected _statusMap = {
    [SPELL_DBC_TABLE]: signal(false),
  };
}

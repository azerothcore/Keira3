import { Service, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { SPELL_DBC_TABLE, SpellDbc } from '@keira/shared/acore-world-model';

@Service()
export class SpellHandlerService extends HandlerService<SpellDbc> {
  protected readonly mainEditorRoutePath = 'spell/spell-dbc';
  protected override readonly copyRoutePath = 'spell/copy';

  get isSpellDbcUnsaved(): Signal<boolean> {
    return this.statusMap[SPELL_DBC_TABLE].asReadonly();
  }

  protected _statusMap = {
    [SPELL_DBC_TABLE]: signal(false),
  };
}

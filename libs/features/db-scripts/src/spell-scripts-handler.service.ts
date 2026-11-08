import { Service, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { SPELL_SCRIPTS_TABLE, SpellScripts } from '@keira/shared/acore-world-model';

@Service()
export class SpellScriptsHandlerService extends HandlerService<SpellScripts> {
  protected readonly mainEditorRoutePath = 'db-scripts/spell-scripts';

  get isSpellScriptsUnsaved(): Signal<boolean> {
    return this.statusMap[SPELL_SCRIPTS_TABLE].asReadonly();
  }

  protected _statusMap = {
    [SPELL_SCRIPTS_TABLE]: signal(false),
  };
}

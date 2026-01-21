import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { SPELL_DBC_TABLE, SpellDbc } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class SpellHandlerService extends HandlerService<SpellDbc> {
  protected readonly mainEditorRoutePath = 'spell/spell-dbc';
  protected override readonly copyRoutePath = 'spell/copy';

  get isSpellDbcUnsaved(): Signal<boolean> {
    return this.statusMap[SPELL_DBC_TABLE].asReadonly();
  }

  protected _statusMap = {
    [SPELL_DBC_TABLE]: signal(false),
  };

  override select(isNew: boolean, id: string | number | Partial<SpellDbc>, name?: string, navigate = true, sourceId?: string) {
    // If we're creating a new entity from a copy, navigate to copy route
    if (isNew && sourceId) {
      super.select(isNew, id, name, false, sourceId);
      this.router.navigate([this.copyRoutePath]);
    } else {
      super.select(isNew, id, name, navigate);
    }
  }
}

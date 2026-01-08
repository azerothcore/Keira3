import { Injectable, signal, Signal } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { SPELL_LOOT_TEMPLATE_TABLE, SpellLootTemplate } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class SpellLootHandlerService extends HandlerService<SpellLootTemplate> {
  protected readonly mainEditorRoutePath = 'other-loots/spell';
  protected readonly copyRoutePath = 'other-loots/spell-copy';

  override select(isNew: boolean, id: string | number | Partial<SpellLootTemplate>, name?: string, navigate = true, sourceId?: string) {
    if (isNew && sourceId) {
      super.select(isNew, id, name, false, sourceId);
      this.router.navigate([this.copyRoutePath]);
    } else {
      super.select(isNew, id, name, navigate);
    }
  }

  get isUnsaved(): Signal<boolean> {
    return this.statusMap[SPELL_LOOT_TEMPLATE_TABLE].asReadonly();
  }

  protected _statusMap = {
    [SPELL_LOOT_TEMPLATE_TABLE]: signal(false),
  };
}

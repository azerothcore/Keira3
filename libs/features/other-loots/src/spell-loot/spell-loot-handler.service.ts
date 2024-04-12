import { Injectable } from '@angular/core';
import { HandlerService } from '@keira/shared/base-abstract-classes';
import { SPELL_LOOT_TEMPLATE_TABLE, SpellLootTemplate } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class SpellLootHandlerService extends HandlerService<SpellLootTemplate> {
  protected readonly mainEditorRoutePath = 'other-loots/spell';

  get isUnsaved(): boolean {
    return this.statusMap[SPELL_LOOT_TEMPLATE_TABLE];
  }

  protected _statusMap = {
    [SPELL_LOOT_TEMPLATE_TABLE]: false,
  };
}

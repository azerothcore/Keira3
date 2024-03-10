import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HandlerService } from '@keira/shared/core';
import { SPELL_LOOT_TEMPLATE_TABLE, SpellLootTemplate } from '@keira/shared/acore-world-model';

@Injectable({
  providedIn: 'root',
})
export class SpellLootHandlerService extends HandlerService<SpellLootTemplate> {
  get isUnsaved(): boolean {
    return this.statusMap[SPELL_LOOT_TEMPLATE_TABLE];
  }

  protected _statusMap = {
    [SPELL_LOOT_TEMPLATE_TABLE]: false,
  };

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected router: Router) {
    super('other-loots/spell', router);
  }
}

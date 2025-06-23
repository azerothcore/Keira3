import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { LOOT_TEMPLATE_ID, LOOT_TEMPLATE_ID_2, SPELL_LOOT_TEMPLATE_TABLE, SpellLootTemplate } from '@keira/shared/acore-world-model';
import { SpellLootHandlerService } from './spell-loot-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SpellLootTemplateService extends MultiRowEditorService<SpellLootTemplate> {
  protected override readonly handlerService = inject(SpellLootHandlerService);
  protected override readonly _entityClass = SpellLootTemplate;
  protected override readonly _entityTable = SPELL_LOOT_TEMPLATE_TABLE;
  protected override readonly _entityIdField = LOOT_TEMPLATE_ID;
  protected override readonly _entitySecondIdField = LOOT_TEMPLATE_ID_2;

  constructor() {
    super();
    this.init();
  }
}

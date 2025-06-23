import { Injectable, inject } from '@angular/core';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import {
  CREATURE_TEMPLATE_SPELL_ID,
  CREATURE_TEMPLATE_SPELL_ID_2,
  CREATURE_TEMPLATE_SPELL_TABLE,
  CreatureTemplateSpell,
} from '@keira/shared/acore-world-model';
import { CreatureHandlerService } from '../creature-handler.service';

@Injectable({
  providedIn: 'root',
})
export class CreatureTemplateSpellService extends MultiRowEditorService<CreatureTemplateSpell> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = CreatureTemplateSpell;
  protected override readonly _entityTable = CREATURE_TEMPLATE_SPELL_TABLE;
  protected override readonly _entityIdField = CREATURE_TEMPLATE_SPELL_ID;
  protected override readonly _entitySecondIdField = CREATURE_TEMPLATE_SPELL_ID_2;

  constructor() {
    super();
    this.init();
  }
}

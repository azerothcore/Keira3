import { inject, Service } from '@angular/core';
import {
  NPC_SPELLCLICK_SPELLS_ID,
  NPC_SPELLCLICK_SPELLS_ID_2,
  NPC_SPELLCLICK_SPELLS_TABLE,
  NpcSpellclickSpells,
} from '@keira/shared/acore-world-model';
import { MultiRowEditorService } from '@keira/shared/base-abstract-classes';
import { CreatureHandlerService } from '../creature-handler.service';

@Service()
export class NpcSpellclickSpellsService extends MultiRowEditorService<NpcSpellclickSpells> {
  protected override readonly handlerService = inject(CreatureHandlerService);
  protected override readonly _entityClass = NpcSpellclickSpells;
  protected override readonly _entityTable = NPC_SPELLCLICK_SPELLS_TABLE;
  protected override readonly _entityIdField = NPC_SPELLCLICK_SPELLS_ID;
  protected override readonly _entitySecondIdField = NPC_SPELLCLICK_SPELLS_ID_2;

  constructor() {
    super();
    this.init();
  }
}

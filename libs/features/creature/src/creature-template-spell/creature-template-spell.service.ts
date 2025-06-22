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
  protected override readonly handlerService: CreatureHandlerService;

  constructor() {
    const handlerService = inject(CreatureHandlerService);

    super(CreatureTemplateSpell, CREATURE_TEMPLATE_SPELL_TABLE, CREATURE_TEMPLATE_SPELL_ID, CREATURE_TEMPLATE_SPELL_ID_2, handlerService);

    this.handlerService = handlerService;
  }
}

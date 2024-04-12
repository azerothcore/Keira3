import { Injectable } from '@angular/core';
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
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected handlerService: CreatureHandlerService) {
    super(CreatureTemplateSpell, CREATURE_TEMPLATE_SPELL_TABLE, CREATURE_TEMPLATE_SPELL_ID, CREATURE_TEMPLATE_SPELL_ID_2, handlerService);
  }
}

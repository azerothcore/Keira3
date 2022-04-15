import { Component, Input } from '@angular/core';
import { SPELL_DBC_CLASS_MASK_FLAGS } from '@keira-shared/constants/flags/spell-dbc-effect-flags';
import { SPELL_DBC_APPLY_AURA_NAME, SPELL_DBC_EFFECT } from '@keira-shared/constants/options/spell-dbc-effects-options';
import { SPELL_MECHANIC } from '@keira-shared/constants/options/spell-mechanic';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { FormGroup } from 'ngx-typesafe-forms';
import { SpellDbcSpellEffectFieldPrefix } from './spell-dbc-spell-effect.model';

@Component({
  selector: 'keira-spell-dbc-spell-effect',
  templateUrl: './spell-dbc-spell-effect.component.html',
})
export class SpellDbcSpellEffectComponent {
  @Input() formGroup: FormGroup<SpellDbc>;
  @Input() index: number;

  public readonly SPELL_MECHANIC = SPELL_MECHANIC;
  public readonly SPELL_DBC_EFFECT = SPELL_DBC_EFFECT;
  public readonly SPELL_DBC_APPLY_AURA_NAME = SPELL_DBC_APPLY_AURA_NAME;
  public readonly SPELL_DBC_CLASS_MASK_FLAGS = SPELL_DBC_CLASS_MASK_FLAGS;

  getFieldName(field: SpellDbcSpellEffectFieldPrefix): string {
    return `${field}_${this.index}`; // example: EffectSpellClassMaskA_3
  }
}

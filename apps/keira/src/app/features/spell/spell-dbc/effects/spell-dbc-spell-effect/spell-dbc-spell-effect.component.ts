import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SPELL_DBC_CLASS_MASK_FLAGS } from '@keira-shared/constants/flags/spell-dbc-effect-flags';
import { SPELL_DBC_APPLY_AURA_NAME, SPELL_DBC_EFFECT } from '@keira-shared/constants/options/spell-dbc-effects-options';
import { SPELL_MECHANIC } from '@keira-shared/constants/options/spell-mechanic';
import { ModelForm } from '@keira-shared/utils/helpers';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { SpellDbcSpellEffectFieldPrefix } from './spell-dbc-spell-effect.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc-spell-effect',
  templateUrl: './spell-dbc-spell-effect.component.html',
})
export class SpellDbcSpellEffectComponent {
  @Input() formGroup: FormGroup<ModelForm<SpellDbc>>;
  @Input() index: number;

  readonly SPELL_MECHANIC = SPELL_MECHANIC;
  readonly SPELL_DBC_EFFECT = SPELL_DBC_EFFECT;
  readonly SPELL_DBC_APPLY_AURA_NAME = SPELL_DBC_APPLY_AURA_NAME;
  readonly SPELL_DBC_CLASS_MASK_FLAGS = SPELL_DBC_CLASS_MASK_FLAGS;

  getFieldName(field: SpellDbcSpellEffectFieldPrefix): string {
    return `${field}_${this.index}`; // example: EffectSpellClassMaskA_3
  }
}

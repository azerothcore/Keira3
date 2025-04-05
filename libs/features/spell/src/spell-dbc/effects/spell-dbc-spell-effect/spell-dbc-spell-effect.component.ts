import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  SPELL_DBC_APPLY_AURA_NAME,
  SPELL_DBC_CLASS_MASK_FLAGS,
  SPELL_DBC_EFFECT,
  SPELL_MECHANIC,
  SpellDbc,
} from '@keira/shared/acore-world-model';
import { ModelForm } from '@keira/shared/utils';
import { SpellDbcSpellEffectFieldPrefix } from './spell-dbc-spell-effect.model';
import { FlagsSelectorBtnComponent, SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc-spell-effect',
  templateUrl: './spell-dbc-spell-effect.component.html',
  imports: [FormsModule, ReactiveFormsModule, TranslateModule, SingleValueSelectorBtnComponent, TooltipModule, FlagsSelectorBtnComponent],
})
export class SpellDbcSpellEffectComponent {
  @Input({ required: true }) formGroup!: FormGroup<ModelForm<SpellDbc>>;
  @Input({ required: true }) index!: number;

  readonly SPELL_MECHANIC = SPELL_MECHANIC;
  readonly SPELL_DBC_EFFECT = SPELL_DBC_EFFECT;
  readonly SPELL_DBC_APPLY_AURA_NAME = SPELL_DBC_APPLY_AURA_NAME;
  readonly SPELL_DBC_CLASS_MASK_FLAGS = SPELL_DBC_CLASS_MASK_FLAGS;

  getFieldName(field: SpellDbcSpellEffectFieldPrefix): string {
    return `${field}_${this.index}`; // example: EffectSpellClassMaskA_3
  }
}

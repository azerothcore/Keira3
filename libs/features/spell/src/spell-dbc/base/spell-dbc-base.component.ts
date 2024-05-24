import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  DISPEL_TYPE,
  SPELL_DBC_CAST_TIME,
  SPELL_DBC_CASTER_AURA_STATE,
  SPELL_DBC_DAMAGE_CLASS,
  SPELL_DBC_POWER_TYPE,
  SPELL_DBC_PREVENTION_TYPE,
  SPELL_DBC_TARGET_AURA_STATE,
  SPELL_MECHANIC,
  SPELL_SCHOOL_MASK,
  SpellDbc,
} from '@keira/shared/acore-world-model';
import { ModelForm } from '@keira/shared/utils';
import { FlagsSelectorBtnComponent } from '@keira/shared/selectors';
import { SingleValueSelectorBtnComponent } from '@keira/shared/selectors';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc-base',
  templateUrl: './spell-dbc-base.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, TranslateModule, TooltipModule, SingleValueSelectorBtnComponent, FlagsSelectorBtnComponent],
})
export class SpellDbcBaseComponent {
  readonly SPELL_DBC_SCHOOL_OPTIONS = SPELL_SCHOOL_MASK;
  readonly DISPEL_TYPE = DISPEL_TYPE;
  readonly SPELL_MECHANIC = SPELL_MECHANIC;
  readonly SPELL_DBC_POWER_TYPE = SPELL_DBC_POWER_TYPE;
  readonly SPELL_DBC_CAST_TIME = SPELL_DBC_CAST_TIME;
  readonly SPELL_DBC_CASTER_AURA_STATE = SPELL_DBC_CASTER_AURA_STATE;
  readonly SPELL_DBC_TARGET_AURA_STATE = SPELL_DBC_TARGET_AURA_STATE;
  readonly SPELL_DBC_DAMAGE_CLASS = SPELL_DBC_DAMAGE_CLASS;
  readonly SPELL_DBC_PREVENTION_TYPE = SPELL_DBC_PREVENTION_TYPE;

  @Input({ required: true }) formGroup!: FormGroup<ModelForm<SpellDbc>>;
}

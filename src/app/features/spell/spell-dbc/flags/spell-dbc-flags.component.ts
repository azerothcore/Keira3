import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
  SPELL_DBC_ATTRIBUTES_FLAGS,
  SPELL_DBC_AURA_INTERRUPT_FLAGS,
  SPELL_DBC_CHANNEL_INTERRUPT_FLAGS,
  SPELL_DBC_CREATURE_TYPE_FLAGS,
  SPELL_DBC_FACING_FRONT_FLAG,
  SPELL_DBC_INTERRUPT_FLAGS,
  SPELL_DBC_STANCES_FLAGS,
} from '@keira-shared/constants/flags/spell-dbc-flags-flags';
import { ModelForm } from '@keira-shared/utils/helpers';
import { SpellDbc } from '@keira-types/spell-dbc.type';

@Component({
  selector: 'keira-spell-dbc-flags',
  templateUrl: './spell-dbc-flags.component.html',
})
export class SpellDbcFlagsComponent {
  readonly SPELL_DBC_ATTRIBUTES_FLAGS = SPELL_DBC_ATTRIBUTES_FLAGS;
  readonly SPELL_DBC_AURA_INTERRUPT_FLAGS = SPELL_DBC_AURA_INTERRUPT_FLAGS;
  readonly SPELL_DBC_CHANNEL_INTERRUPT_FLAGS = SPELL_DBC_CHANNEL_INTERRUPT_FLAGS;
  readonly SPELL_DBC_INTERRUPT_FLAGS = SPELL_DBC_INTERRUPT_FLAGS;
  readonly SPELL_DBC_CREATURE_TYPE_FLAGS = SPELL_DBC_CREATURE_TYPE_FLAGS;
  readonly SPELL_DBC_STANCES_FLAGS = SPELL_DBC_STANCES_FLAGS;
  readonly SPELL_DBC_FACING_FRONT_FLAG = SPELL_DBC_FACING_FRONT_FLAG;

  @Input() formGroup: FormGroup<ModelForm<SpellDbc>>;
}

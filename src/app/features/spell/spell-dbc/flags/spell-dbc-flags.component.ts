import { Component, Input } from '@angular/core';
import { FormGroup } from 'ngx-typesafe-forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import {
  SPELL_DBC_ATTRIBUTES_FLAGS,
  SPELL_DBC_AURA_INTERRUPT_FLAGS,
  SPELL_DBC_CHANNEL_INTERRUPT_FLAGS,
  SPELL_DBC_INTERRUPT_FLAGS,
  SPELL_DBC_CREATURE_TYPE_FLAGS,
  SPELL_DBC_STANCES_FLAGS,
  SPELL_DBC_FACING_FRONT_FLAG,
} from '@keira-shared/constants/flags/spell_dbc_flags_flags';

@Component({
  selector: 'keira-spell-dbc-flags',
  templateUrl: './spell-dbc-flags.component.html',
})
export class SpellDbcFlagsComponent {
  public readonly SPELL_DBC_ATTRIBUTES_FLAGS = SPELL_DBC_ATTRIBUTES_FLAGS;
  public readonly SPELL_DBC_AURA_INTERRUPT_FLAGS = SPELL_DBC_AURA_INTERRUPT_FLAGS;
  public readonly SPELL_DBC_CHANNEL_INTERRUPT_FLAGS = SPELL_DBC_CHANNEL_INTERRUPT_FLAGS;
  public readonly SPELL_DBC_INTERRUPT_FLAGS = SPELL_DBC_INTERRUPT_FLAGS;
  public readonly SPELL_DBC_CREATURE_TYPE_FLAGS = SPELL_DBC_CREATURE_TYPE_FLAGS;
  public readonly SPELL_DBC_STANCES_FLAGS = SPELL_DBC_STANCES_FLAGS;
  readonly SPELL_DBC_FACING_FRONT_FLAG = SPELL_DBC_FACING_FRONT_FLAG;

  @Input() formGroup: FormGroup<SpellDbc>;
}

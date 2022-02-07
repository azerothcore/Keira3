import { Component, Input } from '@angular/core';
import { FormGroup } from 'ngx-typesafe-forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { SPELL_SCHOOL_MASK } from '@keira-shared/constants/flags/spell-school-mask';
import { DISPEL_TYPE } from '@keira-shared/constants/options/dispel-type';
import { SPELL_MECHANIC } from '@keira-shared/constants/options/spell-mechanic';
import {
  SPELL_DBC_CAST_TIME,
  SPELL_DBC_POWER_TYPE,
  SPELL_DBC_CASTER_AURA_STATE,
  SPELL_DBC_TARGET_AURA_STATE,
  SPELL_DBC_DAMAGE_CLASS,
  SPELL_DBC_PREVENTION_TYPE,
} from '@keira-shared/constants/options/spell_dbc_base_options';

@Component({
  selector: 'keira-spell-dbc-base',
  templateUrl: './spell-dbc-base.component.html',
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

  @Input() formGroup: FormGroup<SpellDbc>;
}

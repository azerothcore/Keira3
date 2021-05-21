import { Component, Input } from '@angular/core';
import { FormGroup } from 'ngx-typesafe-forms';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { SPELL_DBC_SCHOOL_OPTIONS } from '@keira-shared/constants/flags/spell_dbc_school_options';
import { SPELL_DBC_FACING_FRONT_FLAG } from '@keira-shared/constants/flags/spell_dbc_facing_front_flag';

@Component({
  selector: 'keira-spell-dbc-base',
  templateUrl: './spell-dbc-base.component.html',
})
export class SpellDbcBaseComponent {
	
  public readonly SPELL_DBC_SCHOOL_OPTIONS = SPELL_DBC_SCHOOL_OPTIONS;
  public readonly SPELL_DBC_FACING_FRONT_FLAG = SPELL_DBC_FACING_FRONT_FLAG;
	
  @Input() formGroup: FormGroup<SpellDbc>;
}

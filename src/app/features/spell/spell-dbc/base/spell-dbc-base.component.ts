import { Component, Input } from '@angular/core';
import { FormGroup } from 'ngx-typesafe-forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { SPELL_DBC_SCHOOL_OPTIONS } from '@keira-shared/constants/flags/spell_dbc_school_options';
import { SPELL_DBC_FACING_FRONT_FLAG } from '@keira-shared/constants/flags/spell_dbc_facing_front_flag';
import { DISPEL_TYPE } from '@keira-shared/constants/options/dispel-type';
import { SPELL_MECHANIC } from '@keira-shared/constants/options/spell-mechanic';
import { TOTEM_CATEGORY } from '@keira-shared/constants/options/totem-category';

@Component({
  selector: 'keira-spell-dbc-base',
  templateUrl: './spell-dbc-base.component.html',
})
export class SpellDbcBaseComponent {
  readonly SPELL_DBC_SCHOOL_OPTIONS = SPELL_DBC_SCHOOL_OPTIONS;
  readonly SPELL_DBC_FACING_FRONT_FLAG = SPELL_DBC_FACING_FRONT_FLAG;
  readonly DISPEL_TYPE = DISPEL_TYPE;
  readonly SPELL_MECHANIC = SPELL_MECHANIC;
  readonly TOTEM_CATEGORY = TOTEM_CATEGORY;

  @Input() formGroup: FormGroup<SpellDbc>;
}

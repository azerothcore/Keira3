import { Component, Input } from '@angular/core';
import { FormGroup } from 'ngx-typesafe-forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { SPELL_DBC_TARGETS, SPELL_DBC_PROC_FLAGS } from '@keira-shared/constants/flags/spell-dbc-effect-flags';

@Component({
  selector: 'keira-spell-dbc-effects',
  templateUrl: './spell-dbc-effects.component.html',
})
export class SpellDbcEffectsComponent {
  readonly SPELL_DBC_TARGETS = SPELL_DBC_TARGETS;
  readonly SPELL_DBC_PROC_FLAGS = SPELL_DBC_PROC_FLAGS;

  @Input() formGroup: FormGroup<SpellDbc>;
}

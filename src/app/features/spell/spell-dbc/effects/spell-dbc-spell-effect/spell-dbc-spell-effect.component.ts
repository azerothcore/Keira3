import { Component, Input } from '@angular/core';
import { FormGroup } from 'ngx-typesafe-forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { SpellDbcSpellEffectFieldPrefix } from './spell-dbc-spell-effect.model';
import { SPELL_MECHANIC } from '@keira-shared/constants/options/spell-mechanic';

@Component({
  selector: 'keira-spell-dbc-spell-effect',
  templateUrl: './spell-dbc-spell-effect.component.html',
})
export class SpellDbcSpellEffectComponent {
  @Input() formGroup: FormGroup<SpellDbc>;
  @Input() index: number;

  readonly SPELL_MECHANIC = SPELL_MECHANIC;

  getFieldName(field: SpellDbcSpellEffectFieldPrefix): string {
    return `${field}_${this.index}`; // example: EffectSpellClassMaskA_3
  }
}

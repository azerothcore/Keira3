import { Component, Input } from '@angular/core';
import { FormGroup } from 'ngx-typesafe-forms';
import { SpellDbc } from '@keira-types/spell-dbc.type';

@Component({
  selector: 'keira-spell-dbc-effects',
  templateUrl: './spell-dbc-effects.component.html',
})
export class SpellDbcEffectsComponent {
  @Input() formGroup: FormGroup<SpellDbc>;
}

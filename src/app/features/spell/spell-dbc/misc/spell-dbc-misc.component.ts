import { Component, Input } from '@angular/core';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { FormGroup } from 'ngx-typesafe-forms';

@Component({
  selector: 'keira-spell-dbc-misc',
  templateUrl: './spell-dbc-misc.component.html',
})
export class SpellDbcMiscComponent {
  @Input() formGroup: FormGroup<SpellDbc>;
}

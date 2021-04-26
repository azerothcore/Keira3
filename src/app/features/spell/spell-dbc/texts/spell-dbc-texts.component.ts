import { Component, Input } from '@angular/core';
import { FormGroup } from 'ngx-typesafe-forms';
import { SpellDbc } from '@keira-types/spell-dbc.type';

@Component({
  selector: 'keira-spell-dbc-texts',
  templateUrl: './spell-dbc-texts.component.html',
})
export class SpellDbcTextsComponent {
  @Input() formGroup: FormGroup<SpellDbc>;
}

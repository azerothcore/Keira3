import { Component, Input } from '@angular/core';
import { FormGroup } from 'ngx-typesafe-forms';
import { SpellDbc } from '@keira-types/spell-dbc.type';

@Component({
  selector: 'keira-spell-dbc-base',
  templateUrl: './spell-dbc-base.component.html',
})
export class SpellDbcBaseComponent {
  @Input() formGroup: FormGroup<SpellDbc>;
}

import { Component, Input } from '@angular/core';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { FormGroup } from 'ngx-typesafe-forms';
import { LOCALES } from './spell-dbc-texts.model';

@Component({
  selector: 'keira-spell-dbc-texts',
  templateUrl: './spell-dbc-texts.component.html',
})
export class SpellDbcTextsComponent {
  readonly LOCALES = LOCALES;
  @Input() formGroup: FormGroup<SpellDbc>;
}

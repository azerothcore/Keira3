import { Component, Input } from '@angular/core';
import { FormGroup } from 'ngx-typesafe-forms';
import { Locale, SPELL_DBC_TEXT_FIELDS, SpellDbcFieldPrefix } from '../spell-dbc-texts.model';
import { SpellDbc } from '@keira-types/spell-dbc.type';

@Component({
  selector: 'keira-spell-dbc-locale',
  templateUrl: './spell-dbc-locale.component.html',
})
export class SpellDbcLocaleComponent {
  readonly FIELDS = SPELL_DBC_TEXT_FIELDS;

  @Input() formGroup: FormGroup<SpellDbc>;
  @Input() locale: Locale;

  getFieldName(field: SpellDbcFieldPrefix): string {
    return `${field}_${this.locale}`; // example: NameSubtext_Lang_esES
  }
}

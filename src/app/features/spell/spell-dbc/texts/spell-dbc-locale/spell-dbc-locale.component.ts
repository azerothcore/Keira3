import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModelForm } from '@keira-shared/utils/helpers';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { Locale, SpellDbcTextFieldPrefix, SPELL_DBC_TEXT_FIELDS } from '../spell-dbc-texts.model';

@Component({
  selector: 'keira-spell-dbc-locale',
  templateUrl: './spell-dbc-locale.component.html',
})
export class SpellDbcLocaleComponent {
  readonly FIELDS = SPELL_DBC_TEXT_FIELDS;

  @Input() formGroup: FormGroup<ModelForm<SpellDbc>>;
  @Input() locale: Locale;

  getFieldName(field: SpellDbcTextFieldPrefix): string {
    return `${field}_${this.locale}`; // example: NameSubtext_Lang_esES
  }
}

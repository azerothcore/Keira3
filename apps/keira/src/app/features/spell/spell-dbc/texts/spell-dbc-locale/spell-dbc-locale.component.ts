import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModelForm } from '@keira/core';
import { SpellDbc } from '@keira/acore-world-model';
import { Locale, SPELL_DBC_TEXT_FIELDS, SpellDbcTextFieldPrefix } from '../spell-dbc-texts.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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

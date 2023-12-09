import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModelForm } from '@keira-shared/utils/helpers';
import { SpellDbc } from '@keira-types/spell-dbc.type';
import { Locale, SpellDbcTextFieldPrefix, SPELL_DBC_TEXT_FIELDS } from '../spell-dbc-texts.model';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default, // TODO: migrate to OnPush: https://github.com/azerothcore/Keira3/issues/2602
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

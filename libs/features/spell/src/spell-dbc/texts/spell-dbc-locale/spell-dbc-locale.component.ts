import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModelForm } from '@keira/shared/utils';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { Locale, SPELL_DBC_TEXT_FIELDS, SpellDbcTextFieldPrefix } from '../spell-dbc-texts.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc-locale',
  templateUrl: './spell-dbc-locale.component.html',
  imports: [FormsModule, ReactiveFormsModule],
})
export class SpellDbcLocaleComponent {
  readonly FIELDS = SPELL_DBC_TEXT_FIELDS;

  @Input({ required: true }) formGroup!: FormGroup<ModelForm<SpellDbc>>;
  readonly locale = input.required<Locale>();

  getFieldName(field: SpellDbcTextFieldPrefix): string {
    return `${field}_${this.locale()}`; // example: NameSubtext_Lang_esES
  }
}

import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModelForm } from '@keira-shared/utils/helpers';
import { SpellDbc } from '@keira-types/spell-dbc.type';

@Component({
  selector: 'keira-spell-dbc-misc',
  templateUrl: './spell-dbc-misc.component.html',
})
export class SpellDbcMiscComponent {
  @Input() formGroup: FormGroup<ModelForm<SpellDbc>>;
}

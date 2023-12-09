import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModelForm } from '@keira-shared/utils/helpers';
import { SpellDbc } from '@keira-types/spell-dbc.type';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-spell-dbc-misc',
  templateUrl: './spell-dbc-misc.component.html',
})
export class SpellDbcMiscComponent {
  @Input() formGroup: FormGroup<ModelForm<SpellDbc>>;
}

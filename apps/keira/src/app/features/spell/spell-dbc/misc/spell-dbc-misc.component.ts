import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModelForm } from '@keira/core';
import { SpellDbc } from '@keira/acore-world-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc-misc',
  templateUrl: './spell-dbc-misc.component.html',
})
export class SpellDbcMiscComponent {
  @Input() formGroup: FormGroup<ModelForm<SpellDbc>>;
}

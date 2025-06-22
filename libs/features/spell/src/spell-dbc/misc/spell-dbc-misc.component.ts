import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModelForm } from '@keira/shared/utils';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc-misc',
  templateUrl: './spell-dbc-misc.component.html',
  imports: [FormsModule, ReactiveFormsModule, TooltipModule, TranslateModule],
})
export class SpellDbcMiscComponent {
  readonly formGroup = input.required<FormGroup<ModelForm<SpellDbc>>>();
}

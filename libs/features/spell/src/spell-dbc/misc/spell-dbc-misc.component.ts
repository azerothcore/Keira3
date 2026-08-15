import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ModelForm } from '@keira/shared/utils';
import { SpellDbc } from '@keira/shared/acore-world-model';
import { TranslatePipe } from '@ngx-translate/core';
import { TooltipDirective } from 'ngx-bootstrap/tooltip';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-spell-dbc-misc',
  templateUrl: './spell-dbc-misc.component.html',
  imports: [FormsModule, ReactiveFormsModule, TooltipDirective, TranslatePipe],
})
export class SpellDbcMiscComponent {
  readonly formGroup = input.required<FormGroup<ModelForm<SpellDbc>>>();
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-boolean-option-selector',
  templateUrl: './boolean-option-selector.component.html',
  imports: [ReactiveFormsModule, TranslatePipe],
})
export class BooleanOptionSelectorComponent {
  readonly control = input.required<FormControl>();
}

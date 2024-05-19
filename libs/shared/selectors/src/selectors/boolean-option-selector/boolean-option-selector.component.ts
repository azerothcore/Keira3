import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-boolean-option-selector',
  templateUrl: './boolean-option-selector.component.html',
  imports: [FormsModule, ReactiveFormsModule],
  standalone: true,
})
export class BooleanOptionSelectorComponent {
  control = input.required<FormControl>();
  controlName = input.required<string>();
}

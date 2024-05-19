import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Option } from '@keira/shared/constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-generic-option-selector',
  templateUrl: './generic-option-selector.component.html',
  imports: [FormsModule, ReactiveFormsModule],
  standalone: true,
})
export class GenericOptionSelectorComponent {
  control = input.required<FormControl>();
  controlName = input.required<string>();
  optionList = input.required<Option[]>();
}

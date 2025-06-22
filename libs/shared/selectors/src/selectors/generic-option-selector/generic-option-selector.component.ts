import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Option } from '@keira/shared/constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-generic-option-selector',
  templateUrl: './generic-option-selector.component.html',
  imports: [ReactiveFormsModule],
})
export class GenericOptionSelectorComponent {
  readonly control = input.required<FormControl>();
  readonly optionList = input.required<Option[]>();
  @Input() placeholder = '';
  readonly placeholderValue = input<string | number>();
}

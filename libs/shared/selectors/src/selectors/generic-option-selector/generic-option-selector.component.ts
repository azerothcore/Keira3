import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Option } from '@keira/shared/constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-generic-option-selector',
  templateUrl: './generic-option-selector.component.html',
  imports: [ReactiveFormsModule],
  standalone: true,
})
export class GenericOptionSelectorComponent {
  @Input({ required: true }) control!: FormControl;
  @Input({ required: true }) optionList!: Option[];
  @Input() placeholder = '';
  @Input() placeholderValue?: string | number;
}

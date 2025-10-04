import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Option } from '@keira/shared/constants';
import { NgxSelectModule } from 'ngx-select-ex';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-generic-option-selector',
  templateUrl: './generic-option-selector.component.html',
  styleUrl: 'generic-option-selector.component.scss',
  imports: [ReactiveFormsModule, NgxSelectModule],
})
export class GenericOptionSelectorComponent {
  readonly control = input.required<FormControl>();
  readonly optionList = input.required<Option[]>();
  readonly placeholder = input('');
  readonly placeholderValue = input<string | number>();
}

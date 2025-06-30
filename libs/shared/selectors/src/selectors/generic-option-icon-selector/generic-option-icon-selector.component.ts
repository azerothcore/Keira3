import { ChangeDetectionStrategy, Component, Input, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Option } from '@keira/shared/constants';
import { NgxSelectModule } from 'ngx-select-ex';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-generic-option-icon-selector',
  templateUrl: './generic-option-icon-selector.component.html',
  styleUrl: 'generic-option-icon-selector.component.scss',
  imports: [ReactiveFormsModule, NgxSelectModule],
})
export class GenericOptionIconSelectorComponent {
  readonly control = input.required<FormControl>();
  readonly optionList = input.required<Option[]>();
  @Input() placeholder = '';
  readonly placeholderValue = input<string | number>();
}

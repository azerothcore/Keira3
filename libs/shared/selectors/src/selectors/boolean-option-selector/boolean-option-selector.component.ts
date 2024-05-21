import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-boolean-option-selector',
  templateUrl: './boolean-option-selector.component.html',
  imports: [ReactiveFormsModule, TranslateModule],
  standalone: true,
})
export class BooleanOptionSelectorComponent {
  @Input({ required: true }) control: FormControl;
  @Input({ required: true }) controlName: string;
}

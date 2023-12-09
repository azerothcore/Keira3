import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SwitchLanguageService } from './switch-language.service';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-switch-language',
  templateUrl: './switch-language.component.html',
  styleUrls: ['./switch-language.component.scss'],
})
export class SwitchLanguageComponent {
  @Input() longVersion = true;

  constructor(public readonly switchLanguageService: SwitchLanguageService) {}
}

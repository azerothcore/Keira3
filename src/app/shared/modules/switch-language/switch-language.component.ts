import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SwitchLanguageService } from './switch-language.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-switch-language',
  templateUrl: './switch-language.component.html',
  styleUrls: ['./switch-language.component.scss'],
})
export class SwitchLanguageComponent {
  @Input() longVersion = true;

  constructor(public readonly switchLanguageService: SwitchLanguageService) {}
}

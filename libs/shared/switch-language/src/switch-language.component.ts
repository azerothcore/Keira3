import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SwitchLanguageService } from './switch-language.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-switch-language',
  templateUrl: './switch-language.component.html',
  styleUrls: ['./switch-language.component.scss'],
  standalone: true,
  imports: [FormsModule, TranslateModule],
})
export class SwitchLanguageComponent {
  @Input() longVersion = true;

  constructor(readonly switchLanguageService: SwitchLanguageService) {}
}

import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SwitchLanguageService } from './switch-language.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-switch-language',
  templateUrl: './switch-language.component.html',
  styleUrls: ['./switch-language.component.scss'],
  imports: [FormsModule, TranslateModule],
})
export class SwitchLanguageComponent {
  @Input() longVersion = true;

  readonly switchLanguageService = inject(SwitchLanguageService);
}

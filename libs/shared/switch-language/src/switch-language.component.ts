import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { SwitchLanguageService } from './switch-language.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-switch-language',
  templateUrl: './switch-language.component.html',
  styleUrls: ['./switch-language.component.scss'],
  standalone: true,
  imports: [NgClass, FormsModule, NgIf, TranslateModule],
})
export class SwitchLanguageComponent {
  @Input() longVersion = true;

  constructor(public readonly switchLanguageService: SwitchLanguageService) {}
}

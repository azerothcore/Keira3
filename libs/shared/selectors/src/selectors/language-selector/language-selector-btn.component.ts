import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { LanguageSelectorModalComponent } from './language-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-language-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class LanguageSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = LanguageSelectorModalComponent;
}

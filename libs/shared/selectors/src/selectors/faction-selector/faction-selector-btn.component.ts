import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { FactionSelectorModalComponent } from './faction-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-faction-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class FactionSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = FactionSelectorModalComponent;
}

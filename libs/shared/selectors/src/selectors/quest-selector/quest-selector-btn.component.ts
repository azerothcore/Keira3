import { ChangeDetectionStrategy, Component } from '@angular/core';

import { QuestSelectorModalComponent } from './quest-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class QuestSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = QuestSelectorModalComponent;
}

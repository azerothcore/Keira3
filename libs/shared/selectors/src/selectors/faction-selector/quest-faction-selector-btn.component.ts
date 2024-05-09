import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { QuestFactionSelectorModalComponent } from './quest-faction-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-quest-faction-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class QuestFactionSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = QuestFactionSelectorModalComponent;
}

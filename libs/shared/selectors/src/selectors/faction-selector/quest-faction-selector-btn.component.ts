import { Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { QuestFactionSelectorModalComponent } from './quest-faction-selector-modal.component';

@Component({
  selector: 'keira-quest-faction-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class QuestFactionSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = QuestFactionSelectorModalComponent;
}

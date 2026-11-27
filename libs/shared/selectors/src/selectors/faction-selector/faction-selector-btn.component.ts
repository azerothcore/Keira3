import { Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { FactionSelectorModalComponent } from './faction-selector-modal.component';

@Component({
  selector: 'keira-faction-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class FactionSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = FactionSelectorModalComponent;
}

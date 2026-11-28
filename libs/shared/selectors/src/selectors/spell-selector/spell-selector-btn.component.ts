import { Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { SpellSelectorModalComponent } from './spell-selector-modal.component';

@Component({
  selector: 'keira-spell-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class SpellSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = SpellSelectorModalComponent;
}

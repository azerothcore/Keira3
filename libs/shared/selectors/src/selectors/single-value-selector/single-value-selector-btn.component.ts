import { Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { SingleValueSelectorModalComponent } from './single-value-selector-modal.component';
import { SingleValueModalConfig } from './single-value-selector.model';

@Component({
  selector: 'keira-single-value-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class SingleValueSelectorBtnComponent extends BaseSelectorBtnComponent<SingleValueModalConfig> {
  protected readonly modalComponentClass = SingleValueSelectorModalComponent;
}

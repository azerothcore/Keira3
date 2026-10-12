import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { OptionsSelectorModalComponent } from './options-selector-modal.component';
import { OptionsModalConfig } from './options-selector.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-options-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class OptionsSelectorBtnComponent extends BaseSelectorBtnComponent<OptionsModalConfig> {
  protected readonly modalComponentClass = OptionsSelectorModalComponent;
}

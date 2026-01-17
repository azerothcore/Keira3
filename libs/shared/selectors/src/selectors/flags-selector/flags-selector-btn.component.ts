import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { FlagsSelectorModalComponent } from './flags-selector-modal.component';
import { FlagsModalConfig } from './flags-selector.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-flags-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class FlagsSelectorBtnComponent extends BaseSelectorBtnComponent<FlagsModalConfig> {
  protected readonly modalComponentClass = FlagsSelectorModalComponent;
}

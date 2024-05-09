import { ChangeDetectionStrategy, Component } from '@angular/core';

import { FlagsSelectorModalComponent } from './flags-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { FlagsModalConfig } from './flags-selector.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-flags-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class FlagsSelectorBtnComponent extends BaseSelectorBtnComponent<FlagsModalConfig> {
  protected readonly modalComponentClass = FlagsSelectorModalComponent;
}

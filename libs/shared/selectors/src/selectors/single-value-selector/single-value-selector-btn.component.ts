import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SingleValueSelectorModalComponent } from './single-value-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { SingleValueModalConfig } from './single-value-selector.model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-single-value-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class SingleValueSelectorBtnComponent extends BaseSelectorBtnComponent<SingleValueModalConfig> {
  protected readonly modalComponentClass = SingleValueSelectorModalComponent;
}

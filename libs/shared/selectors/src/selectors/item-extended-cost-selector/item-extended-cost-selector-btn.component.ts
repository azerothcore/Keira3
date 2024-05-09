import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ItemExtendedCostSelectorModalComponent } from './item-extended-cost-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-extended-cost-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class ItemExtendedCostSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = ItemExtendedCostSelectorModalComponent;
}

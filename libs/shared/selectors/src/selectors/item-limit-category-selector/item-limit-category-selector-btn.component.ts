import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ItemLimitCategorySelectorModalComponent } from './item-limit-category-selector-modal.component';
import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-limit-category-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
  standalone: true,
})
export class ItemLimitCategorySelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = ItemLimitCategorySelectorModalComponent;
}

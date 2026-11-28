import { Component } from '@angular/core';

import { BaseSelectorBtnComponent } from '../base-selector/base-selector-btn.component';
import { ItemEnchantmentSelectorModalComponent } from './item-enchantment-selector-modal.component';

@Component({
  selector: 'keira-item-enchantment-selector-btn',
  templateUrl: '../base-selector/base-selector-btn.component.html',
  styleUrls: ['../base-selector/base-selector-btn.component.scss'],
})
export class ItemEnchantmentSelectorBtnComponent extends BaseSelectorBtnComponent {
  protected readonly modalComponentClass = ItemEnchantmentSelectorModalComponent;
}

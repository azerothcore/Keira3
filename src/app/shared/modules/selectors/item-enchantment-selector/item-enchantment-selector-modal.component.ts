import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ItemEnchantmentSearchService } from '../../search/item-enchantment-search.service';
import { ITEM_ENCHANTMENT_ID } from '@keira-types/item-enchantment.type';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-item-enchantment-selector-modal',
  templateUrl: './item-enchantment-selector-modal.component.html',
  styleUrls: ['./item-enchantment-selector-modal.component.scss'],
})
export class ItemEnchantmentSelectorModalComponent extends SearchSelectorModalComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef, public searchService: ItemEnchantmentSearchService) {
    super(ITEM_ENCHANTMENT_ID, bsModalRef);
  }
}

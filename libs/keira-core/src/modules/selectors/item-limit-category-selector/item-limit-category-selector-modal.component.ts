import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ItemLimitCategorySearchService } from '../../search/item-limit-category-search.service';
import { ITEM_LIMIT_CATEGORY_ID, ItemLimitCategory } from '@keira/acore-world-model';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-limit-category-selector-modal',
  templateUrl: './item-limit-category-selector-modal.component.html',
  styleUrls: ['./item-limit-category-selector-modal.component.scss'],
})
export class ItemLimitCategorySelectorModalComponent extends SearchSelectorModalComponent<ItemLimitCategory> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: ItemLimitCategorySearchService,
  ) {
    super(ITEM_LIMIT_CATEGORY_ID, bsModalRef, searchService);
  }
}

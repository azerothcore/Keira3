import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ItemExtendedCostSearchService } from '../../search/item-extended-cost-search.service';
import { ITEM_EXTENDED_COST_ID } from '@keira-types/item-extended-cost.type';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-item-extended-cost-selector-modal',
  templateUrl: './item-extended-cost-selector-modal.component.html',
  styleUrls: ['./item-extended-cost-selector-modal.component.scss'],
})
export class ItemExtendedCostSelectorModalComponent extends SearchSelectorModalComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef, public searchService: ItemExtendedCostSearchService) {
    super(ITEM_EXTENDED_COST_ID, bsModalRef);
  }
}

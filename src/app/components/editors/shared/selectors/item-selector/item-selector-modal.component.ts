import { Component, } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

import { ItemSearchService } from '../../../../../services/search/item-search.service';
import { ITEM_TEMPLATE_ID } from '../../../../../types/item-template.type';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  selector: 'app-item-selector-modal',
  templateUrl: './item-selector-modal.component.html',
  styleUrls: ['./item-selector-modal.component.scss']
})
export class ItemSelectorModalComponent extends SearchSelectorModalComponent {

  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: ItemSearchService,
  ) {
    super(ITEM_TEMPLATE_ID, bsModalRef);
  }
}

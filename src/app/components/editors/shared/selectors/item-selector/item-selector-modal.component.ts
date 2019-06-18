import { Component, } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap';

import { BaseSelectorModalComponent } from '../base-selector/base-selector-modal.component';
import { ItemSearchService } from '../../../../../services/search/item-search.service';
import { ITEM_TEMPLATE_ID } from '../../../../../types/item-template.type';

@Component({
  selector: 'app-item-selector-modal',
  templateUrl: './item-selector-modal.component.html',
  styleUrls: ['./item-selector-modal.component.scss']
})
export class ItemSelectorModalComponent extends BaseSelectorModalComponent {

  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: ItemSearchService,
  ) {
    super(ITEM_TEMPLATE_ID, bsModalRef);
  }
}

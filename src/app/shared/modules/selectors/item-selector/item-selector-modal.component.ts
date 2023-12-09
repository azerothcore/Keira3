import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ITEM_TEMPLATE_ID } from '@keira-types/item-template.type';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ItemSearchService } from '../../search/item-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

@Component({
  // eslint-disable-next-line @angular-eslint/prefer-on-push-component-change-detection
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'keira-item-selector-modal',
  templateUrl: './item-selector-modal.component.html',
  styleUrls: ['./item-selector-modal.component.scss'],
})
export class ItemSelectorModalComponent extends SearchSelectorModalComponent {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(protected bsModalRef: BsModalRef, public searchService: ItemSearchService) {
    super(ITEM_TEMPLATE_ID, bsModalRef);
  }
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ItemExtendedCostSearchService } from '../../search/item-extended-cost-search.service';
import { ITEM_EXTENDED_COST_ID, ItemExtendedCost } from '@keira/shared/acore-world-model';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgIf } from '@angular/common';
import { HighlightjsWrapperComponent } from '../../highlightjs-wrapper/highlightjs-wrapper.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-extended-cost-selector-modal',
  templateUrl: './item-extended-cost-selector-modal.component.html',
  styleUrls: ['./item-extended-cost-selector-modal.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgIf, NgxDatatableModule, TranslateModule],
})
export class ItemExtendedCostSelectorModalComponent extends SearchSelectorModalComponent<ItemExtendedCost> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: ItemExtendedCostSearchService,
  ) {
    super(ITEM_EXTENDED_COST_ID, bsModalRef, searchService);
  }
}

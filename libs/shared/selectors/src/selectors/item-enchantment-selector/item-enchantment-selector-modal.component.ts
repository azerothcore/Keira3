import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

import { ItemEnchantmentSearchService } from '../../search/item-enchantment-search.service';
import { ITEM_ENCHANTMENT_ID, ItemEnchantment } from '@keira/shared/acore-world-model';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';

import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-enchantment-selector-modal',
  templateUrl: './item-enchantment-selector-modal.component.html',
  styleUrls: ['./item-enchantment-selector-modal.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class ItemEnchantmentSelectorModalComponent extends SearchSelectorModalComponent<ItemEnchantment> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: ItemEnchantmentSearchService,
  ) {
    super(ITEM_ENCHANTMENT_ID, bsModalRef, searchService);
  }
}

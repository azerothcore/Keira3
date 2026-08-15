import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ITEM_ENCHANTMENT_ID, ItemEnchantment } from '@keira/shared/acore-world-model';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { ItemEnchantmentSearchService } from '../../search/item-enchantment-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-enchantment-selector-modal',
  templateUrl: './item-enchantment-selector-modal.component.html',
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateDirective, TranslatePipe],
})
export class ItemEnchantmentSelectorModalComponent extends SearchSelectorModalComponent<ItemEnchantment> {
  protected entityIdField = ITEM_ENCHANTMENT_ID;
  protected searchService = inject(ItemEnchantmentSearchService);
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ITEM_LIMIT_CATEGORY_ID, ItemLimitCategory } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { ItemLimitCategorySearchService } from '../../search/item-limit-category-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-limit-category-selector-modal',
  templateUrl: './item-limit-category-selector-modal.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule],
})
export class ItemLimitCategorySelectorModalComponent extends SearchSelectorModalComponent<ItemLimitCategory> {
  protected entityIdField = ITEM_LIMIT_CATEGORY_ID;
  protected searchService = inject(ItemLimitCategorySearchService);
}

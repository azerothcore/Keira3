import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ITEM_EXTENDED_COST_ID, ItemExtendedCost } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { ItemExtendedCostSearchService } from '../../search/item-extended-cost-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent, IconComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-extended-cost-selector-modal',
  templateUrl: './item-extended-cost-selector-modal.component.html',
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, TranslateModule, IconComponent],
})
export class ItemExtendedCostSelectorModalComponent extends SearchSelectorModalComponent<ItemExtendedCost> {
  protected entityIdField = ITEM_EXTENDED_COST_ID;
  protected searchService = inject(ItemExtendedCostSearchService);
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ITEM_TEMPLATE_ID, ItemTemplate } from '@keira/shared/acore-world-model';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { ItemSearchService } from '../../search/item-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HighlightjsWrapperComponent, IconComponent } from '@keira/shared/base-editor-components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-selector-modal',
  templateUrl: './item-selector-modal.component.html',
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, IconComponent, TranslateModule],
})
export class ItemSelectorModalComponent extends SearchSelectorModalComponent<ItemTemplate> {
  protected entityIdField = ITEM_TEMPLATE_ID;
  protected searchService = inject(ItemSearchService);
}

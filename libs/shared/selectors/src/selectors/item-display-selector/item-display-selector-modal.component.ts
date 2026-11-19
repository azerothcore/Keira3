import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { INVENTORY_TYPE, ItemTemplate } from '@keira/shared/acore-world-model';
import { HighlightjsWrapperComponent, IconComponent } from '@keira/shared/base-editor-components';
import { TranslateDirective, TranslatePipe } from '@ngx-translate/core';
import { NgxDatatableModule } from '@siemens/ngx-datatable';
import { ItemDisplaySearchService } from '../../search/item-display-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';

/** Picks an item's displayid by its icon, among those other items use (#3184), filtered by name, slot or class. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-display-selector-modal',
  templateUrl: './item-display-selector-modal.component.html',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    HighlightjsWrapperComponent,
    NgxDatatableModule,
    IconComponent,
    TranslateDirective,
    TranslatePipe,
  ],
})
export class ItemDisplaySelectorModalComponent extends SearchSelectorModalComponent<ItemTemplate> {
  protected entityIdField = 'displayid';
  protected searchService = inject(ItemDisplaySearchService);
  protected readonly INVENTORY_TYPE = INVENTORY_TYPE;

  protected slotName(value: number): string {
    return INVENTORY_TYPE.find((option) => Number(option.value) === Number(value))?.name ?? `${value}`;
  }
}

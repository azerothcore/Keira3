import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ITEM_TEMPLATE_ID, ItemTemplate } from '@keira/shared/acore-world-model';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ItemSearchService } from '../../search/item-search.service';
import { SearchSelectorModalComponent } from '../base-selector/search-selector-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { HighlightjsWrapperComponent, IconComponent } from '@keira/shared/base-editor-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'keira-item-selector-modal',
  templateUrl: './item-selector-modal.component.html',
  styleUrls: ['./item-selector-modal.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, HighlightjsWrapperComponent, NgxDatatableModule, IconComponent, TranslateModule],
})
export class ItemSelectorModalComponent extends SearchSelectorModalComponent<ItemTemplate> {
  /* istanbul ignore next */ // because of: https://github.com/gotwarlost/istanbul/issues/690
  constructor(
    protected bsModalRef: BsModalRef,
    public searchService: ItemSearchService,
  ) {
    super(ITEM_TEMPLATE_ID, bsModalRef, searchService);
  }
}

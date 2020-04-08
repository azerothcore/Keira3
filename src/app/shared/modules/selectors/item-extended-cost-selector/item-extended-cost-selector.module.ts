import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ItemExtendedCostSelectorModalComponent } from './item-extended-cost-selector-modal.component';
import { ItemExtendedCostSelectorBtnComponent } from './item-extended-cost-selector-btn.component';
import { highlightOptions } from '@keira-config/highlight.config';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  entryComponents: [
    ItemExtendedCostSelectorModalComponent,
  ],
  declarations: [
    ItemExtendedCostSelectorBtnComponent,
    ItemExtendedCostSelectorModalComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    HighlightModule.forRoot(highlightOptions),
    SearchButtonsModule,
  ],
  exports: [
    ItemExtendedCostSelectorBtnComponent,
  ],
})
export class ItemExtendedCostSelectorModule {}

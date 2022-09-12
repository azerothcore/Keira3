import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ItemExtendedCostSelectorModalComponent } from './item-extended-cost-selector-modal.component';
import { ItemExtendedCostSelectorBtnComponent } from './item-extended-cost-selector-btn.component';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [ItemExtendedCostSelectorBtnComponent, ItemExtendedCostSelectorModalComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule,
    HighlightjsWrapperModule,
    SearchButtonsModule,
    TranslateModule,
  ],
  exports: [ItemExtendedCostSelectorBtnComponent],
})
export class ItemExtendedCostSelectorModule {}

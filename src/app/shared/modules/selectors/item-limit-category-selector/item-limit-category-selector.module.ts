import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ItemLimitCategorySelectorModalComponent } from './item-limit-category-selector-modal.component';
import { ItemLimitCategorySelectorBtnComponent } from './item-limit-category-selector-btn.component';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [
    ItemLimitCategorySelectorBtnComponent,
    ItemLimitCategorySelectorModalComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    HighlightModule,
    SearchButtonsModule,
  ],
  exports: [
    ItemLimitCategorySelectorBtnComponent,
  ],
})
export class ItemLimitCategorySelectorModule {}

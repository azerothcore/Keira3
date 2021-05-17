import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ItemSelectorModalComponent } from './item-selector-modal.component';
import { ItemSelectorBtnComponent } from './item-selector-btn.component';
import { highlightOptions } from '@keira-config/highlight.config';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IconModule } from '@keira-shared/modules/icon/icon.module';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [ItemSelectorBtnComponent, ItemSelectorModalComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    HighlightModule.forRoot(highlightOptions),
    IconModule,
    SearchButtonsModule,
  ],
  exports: [ItemSelectorBtnComponent],
})
export class ItemSelectorModule {}

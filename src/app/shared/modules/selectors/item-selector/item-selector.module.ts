import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ItemSelectorModalComponent } from './item-selector-modal.component';
import { ItemSelectorBtnComponent } from './item-selector-btn.component';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { IconModule } from '@keira-shared/modules/icon/icon.module';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [ItemSelectorBtnComponent, ItemSelectorModalComponent],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule, HighlightjsWrapperModule, IconModule, SearchButtonsModule],
  exports: [ItemSelectorBtnComponent],
})
export class ItemSelectorModule {}

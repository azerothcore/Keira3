import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ItemLimitCategorySelectorModalComponent } from './item-limit-category-selector-modal.component';
import { ItemLimitCategorySelectorBtnComponent } from './item-limit-category-selector-btn.component';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [ItemLimitCategorySelectorBtnComponent, ItemLimitCategorySelectorModalComponent],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule, HighlightjsWrapperModule, TranslateModule],
  exports: [ItemLimitCategorySelectorBtnComponent],
})
export class ItemLimitCategorySelectorModule {}

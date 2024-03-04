import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ItemSelectorBtnComponent } from './item-selector-btn.component';
import { ItemSelectorModalComponent } from './item-selector-modal.component';
import { HighlightjsWrapperModule } from '../../highlightjs-wrapper/highlightjs-wrapper.module';
import { IconModule } from '../../icon/icon.module';

@NgModule({
  declarations: [ItemSelectorBtnComponent, ItemSelectorModalComponent],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule, HighlightjsWrapperModule, IconModule, TranslateModule],
  exports: [ItemSelectorBtnComponent],
})
export class ItemSelectorModule {}

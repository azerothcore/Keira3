import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ItemEnchantmentSelectorModalComponent } from './item-enchantment-selector-modal.component';
import { ItemEnchantmentSelectorBtnComponent } from './item-enchantment-selector-btn.component';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightjsWrapperModule } from '../../highlightjs-wrapper/highlightjs-wrapper.module';

@NgModule({
  declarations: [ItemEnchantmentSelectorBtnComponent, ItemEnchantmentSelectorModalComponent],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule, HighlightjsWrapperModule, TranslateModule],
  exports: [ItemEnchantmentSelectorBtnComponent],
})
export class ItemEnchantmentSelectorModule {}

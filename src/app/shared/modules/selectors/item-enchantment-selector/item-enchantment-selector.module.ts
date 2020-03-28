import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ItemEnchantmentSelectorModalComponent } from './item-enchantment-selector-modal.component';
import { ItemEnchantmentSelectorBtnComponent } from './item-enchantment-selector-btn.component';
import { highlightOptions } from '@keira-config/highlight.config';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  entryComponents: [
    ItemEnchantmentSelectorModalComponent,
  ],
  declarations: [
    ItemEnchantmentSelectorBtnComponent,
    ItemEnchantmentSelectorModalComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    HighlightModule.forRoot(highlightOptions),
  ],
  exports: [
    ItemEnchantmentSelectorBtnComponent,
  ],
})
export class ItemEnchantmentSelectorModule {}

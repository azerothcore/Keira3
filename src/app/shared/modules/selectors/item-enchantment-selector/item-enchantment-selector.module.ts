import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ItemEnchantmentSelectorModalComponent } from './item-enchantment-selector-modal.component';
import { ItemEnchantmentSelectorBtnComponent } from './item-enchantment-selector-btn.component';
import { highlightOptions } from '@keira-config/highlight.config';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [
    ItemEnchantmentSelectorBtnComponent,
    ItemEnchantmentSelectorModalComponent,
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
    ItemEnchantmentSelectorBtnComponent,
  ],
})
export class ItemEnchantmentSelectorModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { FactionSelectorModalComponent } from './faction-selector-modal.component';
import { FactionSelectorBtnComponent } from './faction-selector-btn.component';
import { highlightOptions } from '@keira-config/highlight.config';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [FactionSelectorBtnComponent, FactionSelectorModalComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    HighlightModule.forRoot(highlightOptions),
    SearchButtonsModule,
  ],
  exports: [FactionSelectorBtnComponent],
})
export class FactionSelectorModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { FactionSelectorModalComponent } from './faction-selector-modal.component';
import { FactionSelectorBtnComponent } from './faction-selector-btn.component';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [
    FactionSelectorBtnComponent,
    FactionSelectorModalComponent,
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
    FactionSelectorBtnComponent,
  ],
})
export class FactionSelectorModule {}

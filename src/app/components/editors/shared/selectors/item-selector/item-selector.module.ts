import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ItemSelectorModalComponent } from './item-selector-modal.component';
import { ItemSelectorBtnComponent } from './item-selector-btn.component';
import { highlightOptions } from '../../../../../config/highlight.config';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  entryComponents: [
    ItemSelectorModalComponent,
  ],
  declarations: [
    ItemSelectorBtnComponent,
    ItemSelectorModalComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    HighlightModule.forRoot(highlightOptions),
  ],
  exports: [
    ItemSelectorBtnComponent,
  ],
})
export class ItemSelectorModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { HolidaySelectorModalComponent } from './holiday-selector-modal.component';
import { HolidaySelectorBtnComponent } from './holiday-selector-btn.component';
import { highlightOptions } from '@keira-config/highlight.config';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  entryComponents: [
    HolidaySelectorModalComponent,
  ],
  declarations: [
    HolidaySelectorBtnComponent,
    HolidaySelectorModalComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    HighlightModule.forRoot(highlightOptions),
  ],
  exports: [
    HolidaySelectorBtnComponent,
  ],
})
export class HolidaySelectorModule {}

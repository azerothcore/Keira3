import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ModalModule } from 'ngx-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SingleValueSelectorModalComponent } from './single-value-selector-modal.component';
import { SingleValueSelectorBtnComponent } from './single-value-selector-btn.component';

@NgModule({
  entryComponents: [
    SingleValueSelectorModalComponent,
  ],
  declarations: [
    SingleValueSelectorModalComponent,
    SingleValueSelectorBtnComponent,
  ],
  imports: [
    BrowserModule,
    ModalModule.forRoot(),
    NgxDatatableModule,
  ],
  exports: [
    SingleValueSelectorBtnComponent,
  ],
})
export class SingleValueSelectorModule {}

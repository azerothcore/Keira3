import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { CreatureSelectorModalComponent } from './creature-selector-modal.component';
import { CreatureSelectorBtnComponent } from './creature-selector-btn.component';
import { highlightOptions } from '../../../../../config/highlight.config';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  entryComponents: [
    CreatureSelectorModalComponent,
  ],
  declarations: [
    CreatureSelectorBtnComponent,
    CreatureSelectorModalComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    HighlightModule.forRoot(highlightOptions),
  ],
  exports: [
    CreatureSelectorBtnComponent,
  ],
})
export class CreatureSelectorModule {}

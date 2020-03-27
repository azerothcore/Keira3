import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { LanguageSelectorModalComponent } from './language-selector-modal.component';
import { LanguageSelectorBtnComponent } from './language-selector-btn.component';
import { highlightOptions } from '@keira-config/highlight.config';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  entryComponents: [
    LanguageSelectorModalComponent,
  ],
  declarations: [
    LanguageSelectorBtnComponent,
    LanguageSelectorModalComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    HighlightModule.forRoot(highlightOptions),
  ],
  exports: [
    LanguageSelectorBtnComponent,
  ],
})
export class LanguageSelectorModule {}

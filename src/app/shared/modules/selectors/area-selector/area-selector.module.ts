import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AreaSelectorModalComponent } from './area-selector-modal.component';
import { AreaSelectorBtnComponent } from './area-selector-btn.component';
import { highlightOptions } from '@keira-config/highlight.config';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  entryComponents: [
    AreaSelectorModalComponent,
  ],
  declarations: [
    AreaSelectorBtnComponent,
    AreaSelectorModalComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    HighlightModule.forRoot(highlightOptions),
  ],
  exports: [
    AreaSelectorBtnComponent,
  ],
})
export class AreaSelectorModule {}

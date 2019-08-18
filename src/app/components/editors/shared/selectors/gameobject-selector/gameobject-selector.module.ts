import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { GameobjectSelectorModalComponent } from './gameobject-selector-modal.component';
import { GameobjectSelectorBtnComponent } from './gameobject-selector-btn.component';
import { highlightOptions } from '../../../../../config/highlight.config';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap';

@NgModule({
  entryComponents: [
    GameobjectSelectorModalComponent,
  ],
  declarations: [
    GameobjectSelectorBtnComponent,
    GameobjectSelectorModalComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    HighlightModule.forRoot(highlightOptions),
  ],
  exports: [
    GameobjectSelectorBtnComponent,
  ],
})
export class GameobjectSelectorModule {}

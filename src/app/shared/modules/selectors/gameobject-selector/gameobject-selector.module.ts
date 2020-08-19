import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { GameobjectSelectorModalComponent } from './gameobject-selector-modal.component';
import { GameobjectSelectorBtnComponent } from './gameobject-selector-btn.component';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [
    GameobjectSelectorBtnComponent,
    GameobjectSelectorModalComponent,
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
    GameobjectSelectorBtnComponent,
  ],
})
export class GameobjectSelectorModule {}

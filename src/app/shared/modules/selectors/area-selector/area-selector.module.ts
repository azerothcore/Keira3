import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AreaSelectorModalComponent } from './area-selector-modal.component';
import { AreaSelectorBtnComponent } from './area-selector-btn.component';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [
    AreaSelectorBtnComponent,
    AreaSelectorModalComponent,
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
    AreaSelectorBtnComponent,
  ],
})
export class AreaSelectorModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { HolidaySelectorModalComponent } from './holiday-selector-modal.component';
import { HolidaySelectorBtnComponent } from './holiday-selector-btn.component';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [HolidaySelectorBtnComponent, HolidaySelectorModalComponent],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule.forRoot(), HighlightModule, SearchButtonsModule],
  exports: [HolidaySelectorBtnComponent],
})
export class HolidaySelectorModule {}

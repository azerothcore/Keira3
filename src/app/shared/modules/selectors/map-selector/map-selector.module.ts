import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { MapSelectorModalComponent } from './map-selector-modal.component';
import { MapSelectorBtnComponent } from './map-selector-btn.component';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [MapSelectorBtnComponent, MapSelectorModalComponent],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule.forRoot(), HighlightModule, SearchButtonsModule],
  exports: [MapSelectorBtnComponent],
})
export class MapSelectorModule {}

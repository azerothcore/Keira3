import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { AreaSelectorBtnComponent } from './area-selector-btn.component';
import { AreaSelectorModalComponent } from './area-selector-modal.component';

@NgModule({
  declarations: [AreaSelectorBtnComponent, AreaSelectorModalComponent],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule, HighlightjsWrapperModule, SearchButtonsModule],
  exports: [AreaSelectorBtnComponent],
})
export class AreaSelectorModule {}

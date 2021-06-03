import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { QuestSelectorModalComponent } from './quest-selector-modal.component';
import { QuestSelectorBtnComponent } from './quest-selector-btn.component';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [QuestSelectorBtnComponent, QuestSelectorModalComponent],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule.forRoot(), HighlightModule, SearchButtonsModule],
  exports: [QuestSelectorBtnComponent],
})
export class QuestSelectorModule {}

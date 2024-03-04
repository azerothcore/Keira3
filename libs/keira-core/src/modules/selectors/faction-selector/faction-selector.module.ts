import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FactionSelectorBtnComponent } from './faction-selector-btn.component';
import { FactionSelectorModalComponent } from './faction-selector-modal.component';
import { QuestFactionSelectorBtnComponent } from './quest-faction-selector-btn.component';
import { QuestFactionSelectorModalComponent } from './quest-faction-selector-modal.component';
import { HighlightjsWrapperModule } from '../../highlightjs-wrapper/highlightjs-wrapper.module';

@NgModule({
  declarations: [
    FactionSelectorBtnComponent,
    QuestFactionSelectorBtnComponent,
    FactionSelectorModalComponent,
    QuestFactionSelectorModalComponent,
  ],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule, HighlightjsWrapperModule, TranslateModule],
  exports: [FactionSelectorBtnComponent, QuestFactionSelectorBtnComponent],
})
export class FactionSelectorModule {}

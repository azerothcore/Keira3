import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { CreatureSelectorModalComponent } from './creature-selector-modal.component';
import { CreatureSelectorBtnComponent } from './creature-selector-btn.component';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightjsWrapperModule } from '../../highlightjs-wrapper/highlightjs-wrapper.module';

@NgModule({
  declarations: [CreatureSelectorBtnComponent, CreatureSelectorModalComponent],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule, HighlightjsWrapperModule, TranslateModule],
  exports: [CreatureSelectorBtnComponent],
})
export class CreatureSelectorModule {}

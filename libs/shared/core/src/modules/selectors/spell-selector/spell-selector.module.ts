import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { SpellSelectorModalComponent } from './spell-selector-modal.component';
import { SpellSelectorBtnComponent } from './spell-selector-btn.component';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightjsWrapperModule } from '../../highlightjs-wrapper/highlightjs-wrapper.module';

@NgModule({
  declarations: [SpellSelectorBtnComponent, SpellSelectorModalComponent],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule, HighlightjsWrapperModule, TranslateModule],
  exports: [SpellSelectorBtnComponent],
})
export class SpellSelectorModule {}

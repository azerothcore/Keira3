import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';

import { NpcTextSelectorModalComponent } from './npc-text-selector-modal.component';
import { NpcTextSelectorBtnComponent } from './npc-text-selector-btn.component';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TranslateModule } from '@ngx-translate/core';
import { HighlightjsWrapperModule } from '../../highlightjs-wrapper/highlightjs-wrapper.module';
import { IconModule } from '../../icon/icon.module';

@NgModule({
  declarations: [NpcTextSelectorBtnComponent, NpcTextSelectorModalComponent],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule, HighlightjsWrapperModule, IconModule, TranslateModule],
  exports: [NpcTextSelectorBtnComponent],
})
export class NpcTextSelectorModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ItemExtendedCostSelectorModalComponent } from './item-extended-cost-selector-modal.component';
import { ItemExtendedCostSelectorBtnComponent } from './item-extended-cost-selector-btn.component';

import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TranslateModule } from '@ngx-translate/core';
import { HighlightjsWrapperModule } from '../../highlightjs-wrapper/highlightjs-wrapper.module';

@NgModule({
  declarations: [ItemExtendedCostSelectorBtnComponent, ItemExtendedCostSelectorModalComponent],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule, HighlightjsWrapperModule, TranslateModule],
  exports: [ItemExtendedCostSelectorBtnComponent],
})
export class ItemExtendedCostSelectorModule {}

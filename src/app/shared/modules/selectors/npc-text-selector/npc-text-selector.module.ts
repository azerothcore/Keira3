import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { ModalModule } from 'ngx-bootstrap/modal';

import { NpcTextSelectorModalComponent } from './npc-text-selector-modal.component';
import { NpcTextSelectorBtnComponent } from './npc-text-selector-btn.component';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { IconModule } from '@keira-shared/modules/icon/icon.module';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [NpcTextSelectorBtnComponent, NpcTextSelectorModalComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule,
    HighlightjsWrapperModule,
    IconModule,
    SearchButtonsModule,
    TranslateModule,
  ],
  exports: [NpcTextSelectorBtnComponent],
})
export class NpcTextSelectorModule {}

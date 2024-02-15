import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { GameobjectSelectorModalComponent } from './gameobject-selector-modal.component';
import { GameobjectSelectorBtnComponent } from './gameobject-selector-btn.component';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [GameobjectSelectorBtnComponent, GameobjectSelectorModalComponent],
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ModalModule, HighlightjsWrapperModule, TranslateModule],
  exports: [GameobjectSelectorBtnComponent],
})
export class GameobjectSelectorModule {}

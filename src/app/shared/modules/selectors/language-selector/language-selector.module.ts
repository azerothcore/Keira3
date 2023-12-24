import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { LanguageSelectorBtnComponent } from './language-selector-btn.component';
import { LanguageSelectorModalComponent } from './language-selector-modal.component';

@NgModule({
  declarations: [LanguageSelectorBtnComponent, LanguageSelectorModalComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule,
    HighlightjsWrapperModule,
    TranslateModule,
  ],
  exports: [LanguageSelectorBtnComponent],
})
export class LanguageSelectorModule {}

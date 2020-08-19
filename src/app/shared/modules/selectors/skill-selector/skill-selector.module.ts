import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { SkillSelectorModalComponent } from './skill-selector-modal.component';
import { SkillSelectorBtnComponent } from './skill-selector-btn.component';
import { HighlightModule } from 'ngx-highlightjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ModalModule } from 'ngx-bootstrap/modal';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [
    SkillSelectorBtnComponent,
    SkillSelectorModalComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    NgxDatatableModule,
    ModalModule.forRoot(),
    HighlightModule,
    SearchButtonsModule,
  ],
  exports: [
    SkillSelectorBtnComponent,
  ],
})
export class SkillSelectorModule {}

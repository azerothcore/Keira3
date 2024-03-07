import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectQuestComponent } from './select-quest.component';
import { SelectQuestService } from './select-quest.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, TranslateModule, SelectQuestComponent],
  exports: [SelectQuestComponent],
  providers: [SelectQuestService],
})
export class SelectQuestModule {}

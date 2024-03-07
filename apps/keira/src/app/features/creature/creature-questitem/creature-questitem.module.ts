import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { CreatureQuestitemComponent } from './creature-questitem.component';
import { CreatureQuestitemService } from './creature-questitem.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ToastrModule, TranslateModule, CreatureQuestitemComponent],
  exports: [CreatureQuestitemComponent],
  providers: [CreatureQuestitemService],
})
export class CreatureQuestitemModule {}

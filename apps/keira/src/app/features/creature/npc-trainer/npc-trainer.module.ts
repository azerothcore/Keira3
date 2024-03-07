import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { NpcTrainerComponent } from './npc-trainer.component';
import { NpcTrainerService } from './npc-trainer.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, ToastrModule, NgxDatatableModule, TranslateModule, NpcTrainerComponent],
  exports: [NpcTrainerComponent],
  providers: [NpcTrainerService],
})
export class NpcTrainerModule {}

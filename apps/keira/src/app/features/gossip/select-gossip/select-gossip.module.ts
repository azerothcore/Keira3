import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectGossipComponent } from './select-gossip.component';
import { SelectGossipService } from './select-gossip.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, TranslateModule, SelectGossipComponent],
  exports: [SelectGossipComponent],
  providers: [SelectGossipService],
})
export class SelectGossipModule {}

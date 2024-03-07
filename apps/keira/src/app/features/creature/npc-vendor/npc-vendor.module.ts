import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { NpcVendorComponent } from './npc-vendor.component';
import { NpcVendorService } from './npc-vendor.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, ToastrModule, NgxDatatableModule, TranslateModule, NpcVendorComponent],
  exports: [NpcVendorComponent],
  providers: [NpcVendorService],
})
export class NpcVendorModule {}

import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';

import { GossipMenuOptionComponent } from './gossip-menu-option.component';
import { GossipMenuOptionService } from './gossip-menu-option.service';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    TranslateModule,
    GossipMenuOptionComponent,
  ],
  exports: [GossipMenuOptionComponent],
  providers: [GossipMenuOptionService],
})
export class GossipMenuOptionModule {}

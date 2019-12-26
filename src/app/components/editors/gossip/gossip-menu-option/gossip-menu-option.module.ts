import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { SingleValueSelectorModule } from '../../shared/selectors/single-value-selector/single-value-selector.module';
import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { GossipMenuOptionComponent } from './gossip-menu-option.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  declarations: [
    GossipMenuOptionComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(),
    NgxDatatableModule,
    SingleValueSelectorModule,
  ],
  exports: [
    GossipMenuOptionComponent,
  ],
})
export class GossipMenuOptionModule {}

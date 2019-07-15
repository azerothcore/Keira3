import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { NpcVendorComponent } from './npc-vendor.component';
import { ItemSelectorModule } from '../../shared/selectors/item-selector/item-selector.module';

@NgModule({
  declarations: [
    NpcVendorComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    NgxDatatableModule,
    ItemSelectorModule,
  ],
  exports: [
    NpcVendorComponent,
  ],
})
export class NpcVendorModule {}

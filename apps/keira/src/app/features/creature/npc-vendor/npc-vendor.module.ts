import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import {
  EditorButtonsModule,
  IconModule,
  ItemExtendedCostSelectorModule,
  ItemSelectorModule,
  QueryOutputModule,
  TopBarModule,
} from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { NpcVendorComponent } from './npc-vendor.component';
import { NpcVendorService } from './npc-vendor.service';

@NgModule({
  declarations: [NpcVendorComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    ItemSelectorModule,
    IconModule,
    ItemExtendedCostSelectorModule,
    EditorButtonsModule,
    TranslateModule,
  ],
  exports: [NpcVendorComponent],
  providers: [NpcVendorService],
})
export class NpcVendorModule {}

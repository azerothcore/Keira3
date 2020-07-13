import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { NpcVendorComponent } from './npc-vendor.component';
import { ItemSelectorModule } from '@keira-shared/modules/selectors/item-selector/item-selector.module';
import { NpcVendorService } from './npc-vendor.service';
import { IconModule } from '@keira-shared/modules/icon/icon.module';
import { ItemExtendedCostSelectorModule } from '@keira-shared/modules/selectors/item-extended-cost-selector/item-extended-cost-selector.module';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';

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
    ToastrModule.forRoot(toastrConfig),
    NgxDatatableModule,
    ItemSelectorModule,
    IconModule,
    ItemExtendedCostSelectorModule,
    EditorButtonsModule,
  ],
  exports: [
    NpcVendorComponent,
  ],
  providers: [
    NpcVendorService,
  ],
})
export class NpcVendorModule { }

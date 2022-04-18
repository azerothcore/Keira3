import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';
import { IconModule } from '@keira-shared/modules/icon/icon.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { ItemExtendedCostSelectorModule } from '@keira-shared/modules/selectors/item-extended-cost-selector/item-extended-cost-selector.module';
import { ItemSelectorModule } from '@keira-shared/modules/selectors/item-selector/item-selector.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
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
  ],
  exports: [NpcVendorComponent],
  providers: [NpcVendorService],
})
export class NpcVendorModule {}

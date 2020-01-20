import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '../../../config/toastr.config';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '../../../shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '../../../shared/modules/query-output/query-output.module';
import { PickpocketingLootTemplateComponent } from './pickpocketing-loot-template.component';
import { ItemSelectorModule } from '../../../shared/modules/selectors/item-selector/item-selector.module';
import { FlagsSelectorModule } from '../../../shared/modules/selectors/flags-selector/flags-selector.module';

@NgModule({
  declarations: [
    PickpocketingLootTemplateComponent,
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
    FlagsSelectorModule,
  ],
  exports: [
    PickpocketingLootTemplateComponent,
  ],
})
export class PickpocketingLootTemplateModule {}

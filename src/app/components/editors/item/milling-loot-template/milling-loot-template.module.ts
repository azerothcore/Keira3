import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { MillingLootTemplateComponent } from './milling-loot-template.component';
import { ItemSelectorModule } from '../../shared/selectors/item-selector/item-selector.module';
import { TooltipModule } from 'ngx-bootstrap';
import { FlagsSelectorModule } from '../../shared/selectors/flags-selector/flags-selector.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  declarations: [
    MillingLootTemplateComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ItemSelectorModule,
    FlagsSelectorModule,
    NgxDatatableModule,
  ],
  exports: [
    MillingLootTemplateComponent,
  ],
})
export class MillingLootTemplateModule {}

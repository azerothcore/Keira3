import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { PickpocketingLootTemplateComponent } from './pickpocketing-loot-template.component';
import { ItemSelectorModule } from '../../shared/selectors/item-selector/item-selector.module';
import { FlagsSelectorModule } from '../../shared/selectors/flags-selector/flags-selector.module';

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
    ToastrModule.forRoot(),
    NgxDatatableModule,
    ItemSelectorModule,
    FlagsSelectorModule,
  ],
  exports: [
    PickpocketingLootTemplateComponent,
  ],
})
export class PickpocketingLootTemplateModule {}

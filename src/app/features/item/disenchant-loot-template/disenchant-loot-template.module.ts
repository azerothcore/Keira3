import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { DisenchantLootTemplateComponent } from './disenchant-loot-template.component';
import { ItemSelectorModule } from '@keira-shared/modules/selectors/item-selector/item-selector.module';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DisenchantLootTemplateService } from './disenchant-loot-template.service';
import { IconModule } from '@keira-shared/modules/icon/icon.module';

@NgModule({
  declarations: [
    DisenchantLootTemplateComponent,
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
    IconModule,
  ],
  exports: [
    DisenchantLootTemplateComponent,
  ],
  providers: [
    DisenchantLootTemplateService,
  ],
})
export class DisenchantLootTemplateModule {}

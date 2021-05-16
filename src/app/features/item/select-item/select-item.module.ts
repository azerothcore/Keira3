import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HighlightModule } from 'ngx-highlightjs';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { SelectItemComponent } from './select-item.component';
import { CreateModule } from '@keira-shared/modules/create/create.module';
import { highlightOptions } from '@keira-config/highlight.config';
import { SelectItemService } from './select-item.service';
import { IconModule } from '@keira-shared/modules/icon/icon.module';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [SelectItemComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    CreateModule,
    HighlightModule.forRoot(highlightOptions),
    NgxDatatableModule,
    IconModule,
    SearchButtonsModule,
  ],
  exports: [SelectItemComponent],
  providers: [SelectItemService],
})
export class SelectItemModule {}

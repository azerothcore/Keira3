import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HighlightModule } from 'ngx-highlightjs';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { SelectGossipComponent } from './select-gossip.component';
import { CreateModule } from '@keira-shared/modules/create/create.module';
import { highlightOptions } from '@keira-config/highlight.config';
import { SelectGossipService } from './select-gossip.service';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [SelectGossipComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    CreateModule,
    HighlightModule.forRoot(highlightOptions),
    NgxDatatableModule,
    SearchButtonsModule,
  ],
  exports: [SelectGossipComponent],
  providers: [SelectGossipService],
})
export class SelectGossipModule {}

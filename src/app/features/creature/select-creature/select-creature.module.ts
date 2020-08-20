import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HighlightModule } from 'ngx-highlightjs';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { SelectCreatureComponent } from './select-creature.component';
import { CreateModule } from '@keira-shared/modules/create/create.module';
import { highlightOptions } from '@keira-config/highlight.config';
import { SelectCreatureService } from './select-creature.service';
import { SearchButtonsModule } from '@keira-shared/modules/search-button/search-buttons.module';

@NgModule({
  declarations: [
    SelectCreatureComponent,
  ],
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
  exports: [
    SelectCreatureComponent,
  ],
  providers: [
    SelectCreatureService,
  ],
})
export class SelectCreatureModule {}

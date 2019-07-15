import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HighlightModule } from 'ngx-highlightjs';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { SelectCreatureComponent } from './select-creature.component';
import { CreateModule } from '../../shared/create/create.module';
import { highlightOptions } from '../../../../config/highlight.config';

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
  ],
  exports: [
    SelectCreatureComponent,
  ],
})
export class SelectCreatureModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HighlightModule } from 'ngx-highlightjs';

import { SaiSearchEntityComponent } from './sai-search-entity.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { highlightOptions } from '../../../../config/highlight.config';

@NgModule({
  declarations: [SaiSearchEntityComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    HighlightModule.forRoot(highlightOptions),
    NgxDatatableModule,
  ],
  exports: [SaiSearchEntityComponent],
})
export class SaiSearchEntityModule { }

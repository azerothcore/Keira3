import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { HighlightModule } from 'ngx-highlightjs';

import { TopBarModule } from '../../../shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '../../../shared/modules/query-output/query-output.module';
import { SelectItemComponent } from './select-item.component';
import { CreateModule } from '../../../shared/modules/create/create.module';
import { highlightOptions } from '../../../config/highlight.config';

@NgModule({
  declarations: [
    SelectItemComponent,
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
    SelectItemComponent,
  ],
})
export class SelectItemModule {}

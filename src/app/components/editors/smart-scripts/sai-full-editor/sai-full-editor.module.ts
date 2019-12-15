import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HighlightModule } from 'ngx-highlightjs';
import { ReactiveFormsModule } from '@angular/forms';
import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { highlightOptions } from '../../../../config/highlight.config';
import { TooltipModule } from 'ngx-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SaiEditorModule } from '../../shared/sai-editor/sai-editor.module';
import { SaiFullEditorComponent } from './sai-full-editor.component';

@NgModule({
  declarations: [SaiFullEditorComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    HighlightModule.forRoot(highlightOptions),
    TooltipModule.forRoot(),
    NgxDatatableModule,
    SaiEditorModule,
  ],
  exports: [SaiFullEditorComponent],
})
export class SaiFullEditorModule { }

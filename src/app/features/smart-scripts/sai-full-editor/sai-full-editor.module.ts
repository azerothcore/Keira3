import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HighlightModule } from 'ngx-highlightjs';
import { ReactiveFormsModule } from '@angular/forms';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { highlightOptions } from '../../../config/highlight.config';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '../../../config/toastr.config';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SaiEditorModule } from '@keira-shared/modules/sai-editor/sai-editor.module';
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
    ToastrModule.forRoot(toastrConfig),
    NgxDatatableModule,
    SaiEditorModule,
  ],
  exports: [SaiFullEditorComponent],
})
export class SaiFullEditorModule { }

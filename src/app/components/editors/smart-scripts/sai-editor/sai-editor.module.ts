import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TooltipModule } from 'ngx-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { SaiEditorComponent } from './sai-editor.component';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { SaiTopBarComponent } from './sai-top-bar/sai-top-bar.component';

@NgModule({
  declarations: [
    SaiEditorComponent,
    SaiTopBarComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    NgxDatatableModule,
  ],
  exports: [SaiEditorComponent],
})
export class SaiEditorModule { }

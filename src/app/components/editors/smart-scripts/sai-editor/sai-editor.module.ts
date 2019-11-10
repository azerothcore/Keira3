import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TooltipModule } from 'ngx-bootstrap';

import { SaiEditorComponent } from './sai-editor.component';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';

@NgModule({
  declarations: [SaiEditorComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
  ],
  exports: [SaiEditorComponent],
})
export class SaiEditorModule { }

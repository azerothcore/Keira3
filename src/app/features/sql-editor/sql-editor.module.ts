import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'ngx-bootstrap';

import { SqlEditorComponent } from './sql-editor.component';

@NgModule({
  declarations: [SqlEditorComponent],
  imports: [
    CommonModule,
    TooltipModule.forRoot(),
  ]
})
export class SqlEditorModule { }

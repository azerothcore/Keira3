import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'ngx-bootstrap';

import { SqlEditorComponent } from './sql-editor.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [SqlEditorComponent],
  imports: [
    CommonModule,
    TooltipModule.forRoot(),
    FormsModule,
  ]
})
export class SqlEditorModule { }

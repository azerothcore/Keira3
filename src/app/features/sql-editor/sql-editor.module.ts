import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'ngx-bootstrap';

import { SqlEditorComponent } from './sql-editor.component';
import { FormsModule } from '@angular/forms';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@NgModule({
  declarations: [SqlEditorComponent],
  imports: [
    CommonModule,
    TooltipModule.forRoot(),
    FormsModule,
    QueryOutputModule,
    NgxDatatableModule,
  ]
})
export class SqlEditorModule { }

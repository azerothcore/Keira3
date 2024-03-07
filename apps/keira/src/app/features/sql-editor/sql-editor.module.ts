import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SqlEditorComponent } from './sql-editor.component';
import { SqlEditorService } from './sql-editor.service';

@NgModule({
  imports: [CommonModule, TooltipModule, FormsModule, NgxDatatableModule, TranslateModule, SqlEditorComponent],
  providers: [SqlEditorService],
})
export class SqlEditorModule {}

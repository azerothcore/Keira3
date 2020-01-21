import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '../../../config/toastr.config';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { QueryOutputModule } from '../query-output/query-output.module';
import { SaiEditorComponent } from './sai-editor.component';
import { SaiTopBarComponent } from './sai-top-bar/sai-top-bar.component';
import { FlagsSelectorModule } from '../selectors/flags-selector/flags-selector.module';

@NgModule({
  declarations: [
    SaiEditorComponent,
    SaiTopBarComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    QueryOutputModule,
    FlagsSelectorModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    NgxDatatableModule,
  ],
  exports: [SaiEditorComponent, SaiTopBarComponent],
})
export class SaiEditorModule { }

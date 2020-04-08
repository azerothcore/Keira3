import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { QueryOutputModule } from '../query-output/query-output.module';
import { SaiEditorComponent } from './sai-editor.component';
import { SaiTopBarComponent } from './sai-top-bar/sai-top-bar.component';
import { FlagsSelectorModule } from '../selectors/flags-selector/flags-selector.module';
import { TimedActionlistComponent } from './timed-actionlist/timed-actionlist.component';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';

const components = [
  SaiEditorComponent,
  SaiTopBarComponent,
  TimedActionlistComponent,
];

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    QueryOutputModule,
    FlagsSelectorModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    NgxDatatableModule,
    EditorButtonsModule,
  ]
})
export class SaiEditorModule { }

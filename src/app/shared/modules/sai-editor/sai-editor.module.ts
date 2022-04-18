import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { QueryOutputModule } from '../query-output/query-output.module';
import { FlagsSelectorModule } from '../selectors/flags-selector/flags-selector.module';
import { SaiEditorComponent } from './sai-editor.component';
import { SaiTopBarComponent } from './sai-top-bar/sai-top-bar.component';
import { TimedActionlistComponent } from './timed-actionlist/timed-actionlist.component';

const components = [SaiEditorComponent, SaiTopBarComponent, TimedActionlistComponent];

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    QueryOutputModule,
    FlagsSelectorModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    EditorButtonsModule,
  ],
})
export class SaiEditorModule {}

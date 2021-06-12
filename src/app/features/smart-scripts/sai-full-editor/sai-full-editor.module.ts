import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HighlightjsWrapperModule } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
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
    HighlightjsWrapperModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    SaiEditorModule,
  ],
  exports: [SaiFullEditorComponent],
})
export class SaiFullEditorModule {}

import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { HighlightjsWrapperModule, QueryOutputModule, SaiEditorModule, TopBarModule } from '@keira/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
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

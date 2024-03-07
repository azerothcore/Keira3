import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SaiEditorModule } from '@keira/shared/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { SaiFullEditorComponent } from './sai-full-editor.component';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, ToastrModule, NgxDatatableModule, SaiEditorModule, SaiFullEditorComponent],
  exports: [SaiFullEditorComponent],
})
export class SaiFullEditorModule {}

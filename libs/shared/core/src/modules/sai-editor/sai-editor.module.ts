import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';

import { SaiEditorComponent } from './sai-editor.component';
import { SaiTopBarComponent } from './sai-top-bar/sai-top-bar.component';
import { TimedActionlistComponent } from './timed-actionlist/timed-actionlist.component';

const components = [SaiEditorComponent, SaiTopBarComponent, TimedActionlistComponent];

@NgModule({
  exports: components,
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, ToastrModule, NgxDatatableModule, TranslateModule, ...components],
})
export class SaiEditorModule {}

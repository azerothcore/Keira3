import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { SaiEditorComponent } from './sai-editor.component';

@NgModule({
  declarations: [SaiEditorComponent],
  imports: [
    BrowserModule,
  ],
  exports: [SaiEditorComponent],
})
export class SaiEditorModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { SaiEditorComponent } from './sai-editor.component';
import { SaiTopBarComponent } from './sai-top-bar/sai-top-bar.component';

@NgModule({
  declarations: [
    SaiEditorComponent,
    SaiTopBarComponent,
  ],
  imports: [
    BrowserModule,
  ],
  exports: [SaiEditorComponent],
})
export class SaiEditorModule { }

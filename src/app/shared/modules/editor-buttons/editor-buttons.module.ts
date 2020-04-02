import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorButtonsComponent } from './editor-buttons.component';



@NgModule({
  declarations: [EditorButtonsComponent],
  exports: [
    EditorButtonsComponent
  ],
  imports: [
    CommonModule
  ]
})
export class EditorButtonsModule { }

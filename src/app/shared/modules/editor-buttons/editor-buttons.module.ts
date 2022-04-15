import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EditorButtonsComponent } from './editor-buttons.component';

@NgModule({
  declarations: [EditorButtonsComponent],
  exports: [EditorButtonsComponent],
  imports: [CommonModule],
})
export class EditorButtonsModule {}

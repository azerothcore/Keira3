import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { EditorButtonsComponent } from './editor-buttons.component';

@NgModule({
  declarations: [EditorButtonsComponent],
  exports: [EditorButtonsComponent],
  imports: [CommonModule, TranslateModule],
})
export class EditorButtonsModule {}

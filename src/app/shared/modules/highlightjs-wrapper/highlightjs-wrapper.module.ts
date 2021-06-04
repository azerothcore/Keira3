import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighlightjsWrapperComponent } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.component';

@NgModule({
  declarations: [HighlightjsWrapperComponent],
  exports: [HighlightjsWrapperComponent],
  imports: [CommonModule],
})
export class HighlightjsWrapperModule {}

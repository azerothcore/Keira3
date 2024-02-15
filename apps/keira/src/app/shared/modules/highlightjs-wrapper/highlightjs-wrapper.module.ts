import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HighlightjsWrapperComponent } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.component';
import { HighlightModule } from 'ngx-highlightjs';

@NgModule({
  declarations: [HighlightjsWrapperComponent],
  exports: [HighlightjsWrapperComponent],
  imports: [CommonModule, HighlightModule],
})
export class HighlightjsWrapperModule {}

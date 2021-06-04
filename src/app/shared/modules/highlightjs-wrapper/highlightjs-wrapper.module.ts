import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HighlightModule } from 'ngx-highlightjs';
import { HighlightjsWrapperComponent } from '@keira-shared/modules/highlightjs-wrapper/highlightjs-wrapper.component';

@NgModule({
  declarations: [HighlightjsWrapperComponent],
  exports: [HighlightjsWrapperComponent],
  imports: [CommonModule, HighlightModule],
})
export class HighlightjsWrapperModule {}

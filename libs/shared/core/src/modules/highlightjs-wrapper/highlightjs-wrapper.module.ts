import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HighlightModule } from 'ngx-highlightjs';
import { HighlightjsWrapperComponent } from './highlightjs-wrapper.component';

@NgModule({
  declarations: [HighlightjsWrapperComponent],
  exports: [HighlightjsWrapperComponent],
  imports: [CommonModule, HighlightModule],
})
export class HighlightjsWrapperModule {}

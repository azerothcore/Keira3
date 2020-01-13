import { SafeHtmlPipe } from './safe-html.pipe';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [ SafeHtmlPipe ],
  exports:      [ SafeHtmlPipe ],
})
export class SafeHtmlPipeModule {}

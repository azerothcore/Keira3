import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { TopBarComponent } from './top-bar.component';

@NgModule({
  declarations: [TopBarComponent],
  imports: [BrowserModule],
  exports: [TopBarComponent],
})
export class TopBarModule {}

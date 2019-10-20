import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { SaiSearchExistingComponent } from './sai-search-existing.component';

@NgModule({
  declarations: [SaiSearchExistingComponent],
  imports: [
    BrowserModule
  ],
  exports: [SaiSearchExistingComponent],
})
export class SaiSearchExistingModule { }

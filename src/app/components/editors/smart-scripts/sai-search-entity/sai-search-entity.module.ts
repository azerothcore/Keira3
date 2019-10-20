import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { SaiSearchEntityComponent } from './sai-search-entity.component';

@NgModule({
  declarations: [SaiSearchEntityComponent],
  imports: [
    BrowserModule,
  ],
  exports: [SaiSearchEntityComponent],
})
export class SaiSearchEntityModule { }

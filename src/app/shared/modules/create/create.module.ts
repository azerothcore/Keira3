import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { CreateComponent } from './create.component';

@NgModule({
  declarations: [
    CreateComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
  ],
  exports: [
    CreateComponent,
  ],
})
export class CreateModule {}

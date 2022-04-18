import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CreateComponent } from './create.component';

@NgModule({
  declarations: [CreateComponent],
  imports: [BrowserModule, FormsModule],
  exports: [CreateComponent],
})
export class CreateModule {}

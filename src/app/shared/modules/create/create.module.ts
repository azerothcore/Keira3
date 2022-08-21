import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { CreateComponent } from './create.component';

@NgModule({
  declarations: [CreateComponent],
  imports: [BrowserModule, FormsModule, TranslateModule],
  exports: [CreateComponent],
})
export class CreateModule {}

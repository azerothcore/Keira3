import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { SwitchLanguageComponent } from './switch-language.component';

@NgModule({
  declarations: [SwitchLanguageComponent],
  imports: [BrowserModule, FormsModule, TranslateModule],
  exports: [SwitchLanguageComponent],
})
export class SwitchLanguageModule {}

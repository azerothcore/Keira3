import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { ConnectionWindowComponent } from './connection-window.component';
import { QueryOutputModule, SwitchLanguageModule } from '@keira/core';

@NgModule({
  declarations: [ConnectionWindowComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    QueryOutputModule,
    BsDropdownModule,
    FormsModule,
    TranslateModule,
    SwitchLanguageModule,
  ],
  exports: [ConnectionWindowComponent],
})
export class ConnectionWindowModule {}

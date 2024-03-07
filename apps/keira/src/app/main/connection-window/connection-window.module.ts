import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { TranslateModule } from '@ngx-translate/core';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { ConnectionWindowComponent } from './connection-window.component';
import { SwitchLanguageModule } from '@keira/shared/core';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    BsDropdownModule,
    FormsModule,
    TranslateModule,
    SwitchLanguageModule,
    ConnectionWindowComponent,
  ],
  exports: [ConnectionWindowComponent],
})
export class ConnectionWindowModule {}

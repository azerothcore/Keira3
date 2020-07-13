import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';

import { ConnectionWindowComponent } from './connection-window.component';
import { QueryOutputModule } from '../../shared/modules/query-output/query-output.module';

@NgModule({
  declarations: [
    ConnectionWindowComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    QueryOutputModule,
    // TODO: enable animation once this bug is fixed: https://github.com/valor-software/ngx-bootstrap/issues/5727
    BsDropdownModule.forRoot({ isAnimated: false, autoClose: true }),
    FormsModule,
  ],
  exports: [
    ConnectionWindowComponent,
  ],
})
export class ConnectionWindowModule { }

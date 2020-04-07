import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
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
    BsDropdownModule.forRoot({ isAnimated: true, autoClose: true }),
  ],
  exports: [
    ConnectionWindowComponent,
  ],
})
export class ConnectionWindowModule {}

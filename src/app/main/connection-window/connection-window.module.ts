import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ConnectionWindowComponent } from './connection-window.component';
import { QueryOutputModule } from '../../shared/modules/query-output/query-output.module';
import { BsDropdownModule } from 'ngx-bootstrap';

@NgModule({
  declarations: [
    ConnectionWindowComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    QueryOutputModule,
    BsDropdownModule.forRoot(),
  ],
  exports: [
    ConnectionWindowComponent,
  ],
})
export class ConnectionWindowModule {}

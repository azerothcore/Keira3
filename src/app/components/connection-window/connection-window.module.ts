import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ConnectionWindowComponent } from './connection-window.component';
import { QueryOutputModule } from '../editors/shared/query-output/query-output.module';

@NgModule({
  declarations: [
    ConnectionWindowComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    QueryOutputModule,
  ],
  exports: [
    ConnectionWindowComponent,
  ],
})
export class ConnectionWindowModule {}

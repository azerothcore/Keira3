import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { ConnectionWindowComponent } from './connection-window.component';
import { QueryErrorComponent } from '../editors/shared/query-output/query-error/query-error.component';

@NgModule({
  declarations: [
    ConnectionWindowComponent,
    QueryErrorComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
  ],
  exports: [
    ConnectionWindowComponent,
  ],
})
export class ConnectionWindowModule {}

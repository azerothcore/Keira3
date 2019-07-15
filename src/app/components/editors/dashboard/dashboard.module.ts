import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ClipboardModule } from 'ngx-clipboard';

import { DashboardComponent } from './dashboard.component';

@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    ClipboardModule,
  ],
  exports: [
    DashboardComponent,
  ],
})
export class DashboardModule {}

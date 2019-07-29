import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ClipboardModule } from 'ngx-clipboard';

import { DashboardComponent } from './dashboard.component';

@NgModule({
  declarations: [
    DashboardComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ClipboardModule,
  ],
  exports: [
    DashboardComponent,
  ],
})
export class DashboardModule {}

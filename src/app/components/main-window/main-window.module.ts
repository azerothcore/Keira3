import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';

import { MainWindowComponent } from './main-window.component';
import { SidebarModule } from './sidebar/sidebar.module';

@NgModule({
  declarations: [
    MainWindowComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule,
    SidebarModule,
    ToastrModule.forRoot(),
  ],
  exports: [
    MainWindowComponent,
  ],
})
export class MainWindowModule {}

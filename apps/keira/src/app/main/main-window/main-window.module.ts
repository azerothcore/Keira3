import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { MainWindowComponent } from './main-window.component';
import { SidebarModule } from './sidebar/sidebar.module';

@NgModule({
  imports: [BrowserModule, RouterModule, SidebarModule, MainWindowComponent],
  exports: [MainWindowComponent],
})
export class MainWindowModule {}

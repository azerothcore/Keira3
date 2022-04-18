import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { QueryOutputModule } from '../../shared/modules/query-output/query-output.module';
import { ConnectionWindowComponent } from './connection-window.component';

@NgModule({
  declarations: [ConnectionWindowComponent],
  imports: [BrowserModule, BrowserAnimationsModule, ReactiveFormsModule, QueryOutputModule, BsDropdownModule, FormsModule],
  exports: [ConnectionWindowComponent],
})
export class ConnectionWindowModule {}

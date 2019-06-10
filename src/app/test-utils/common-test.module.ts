import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterTestingModule,
  ],
  exports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterTestingModule,
  ]
})
export class CommonTestModule {}

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchButtonComponent } from './search-button.component';



@NgModule({
  declarations: [SearchButtonComponent],
  exports: [
    SearchButtonComponent
  ],
  imports: [
    CommonModule
  ]
})
export class SearchButtonsModule { }

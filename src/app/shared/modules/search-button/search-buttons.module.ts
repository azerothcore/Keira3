import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SearchButtonComponent } from './search-button.component';

@NgModule({
  declarations: [SearchButtonComponent],
  exports: [SearchButtonComponent],
  imports: [CommonModule],
})
export class SearchButtonsModule {}

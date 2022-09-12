import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SearchButtonComponent } from './search-button.component';

@NgModule({
  declarations: [SearchButtonComponent],
  exports: [SearchButtonComponent],
  imports: [CommonModule, TranslateModule],
})
export class SearchButtonsModule {}

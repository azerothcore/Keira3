import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectItemComponent } from './select-item.component';
import { SelectItemService } from './select-item.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, TranslateModule, SelectItemComponent],
  exports: [SelectItemComponent],
  providers: [SelectItemService],
})
export class SelectItemModule {}

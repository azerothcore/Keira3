import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { ItemEnchantmentTemplateComponent } from './item-enchantment-template.component';
import { ItemEnchantmentTemplateService } from './item-enchantment-template.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ToastrModule, TranslateModule, ItemEnchantmentTemplateComponent],
  exports: [ItemEnchantmentTemplateComponent],
  providers: [ItemEnchantmentTemplateService],
})
export class ItemEnchantmentTemplateModule {}

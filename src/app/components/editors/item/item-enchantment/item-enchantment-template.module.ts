import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { ItemEnchantmentTemplateComponent } from './item-enchantment-template.component';

@NgModule({
  declarations: [
    ItemEnchantmentTemplateComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    NgxDatatableModule,
    ToastrModule.forRoot(),
  ],
  exports: [
    ItemEnchantmentTemplateComponent,
  ],
})
export class ItemEnchantmentTemplateModule {}

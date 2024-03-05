import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { EditorButtonsModule, QueryOutputModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { ItemEnchantmentTemplateComponent } from './item-enchantment-template.component';
import { ItemEnchantmentTemplateService } from './item-enchantment-template.service';

@NgModule({
  declarations: [ItemEnchantmentTemplateComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    NgxDatatableModule,
    ToastrModule,
    EditorButtonsModule,
    TranslateModule,
  ],
  exports: [ItemEnchantmentTemplateComponent],
  providers: [ItemEnchantmentTemplateService],
})
export class ItemEnchantmentTemplateModule {}

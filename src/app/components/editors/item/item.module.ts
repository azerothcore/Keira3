import { NgModule } from '@angular/core';
import { ItemTemplateModule } from './item-template/item-template.module';
import { SelectItemModule } from './select-item/select-item.module';

const modules = [
  SelectItemModule,
  ItemTemplateModule,
];

@NgModule({
  imports: [modules],
  exports: [modules],
})
export class ItemModule {}

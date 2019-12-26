import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '../../../../config/toastr.config';

import { CreatureEquipTemplateComponent } from './creature-equip-template.component';
import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { ItemSelectorModule } from '../../shared/selectors/item-selector/item-selector.module';

@NgModule({
  declarations: [
    CreatureEquipTemplateComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    ItemSelectorModule,
    ToastrModule.forRoot(),
  ],
  exports: [
    CreatureEquipTemplateComponent,
  ],
})
export class CreatureEquipTemplateModule {}

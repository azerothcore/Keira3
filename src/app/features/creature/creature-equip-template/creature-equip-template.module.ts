import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '../../../config/toastr.config';

import { CreatureEquipTemplateComponent } from './creature-equip-template.component';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { ItemSelectorModule } from '@keira-shared/modules/selectors/item-selector/item-selector.module';

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
    ToastrModule.forRoot(toastrConfig),
  ],
  exports: [
    CreatureEquipTemplateComponent,
  ],
})
export class CreatureEquipTemplateModule {}

import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { IconModule } from '@keira-shared/modules/icon/icon.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { ItemSelectorModule } from '@keira-shared/modules/selectors/item-selector/item-selector.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { ToastrModule } from 'ngx-toastr';
import { CreatureEquipTemplateComponent } from './creature-equip-template.component';
import { CreatureEquipTemplateService } from './creature-equip-template.service';

@NgModule({
  declarations: [CreatureEquipTemplateComponent],
  imports: [BrowserModule, ReactiveFormsModule, TopBarModule, QueryOutputModule, ItemSelectorModule, ToastrModule, IconModule],
  exports: [CreatureEquipTemplateComponent],
  providers: [CreatureEquipTemplateService],
})
export class CreatureEquipTemplateModule {}

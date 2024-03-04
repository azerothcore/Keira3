import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { IconModule, ItemSelectorModule, QueryOutputModule, TopBarModule } from '@keira/core';
import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { CreatureEquipTemplateComponent } from './creature-equip-template.component';
import { CreatureEquipTemplateService } from './creature-equip-template.service';

@NgModule({
  declarations: [CreatureEquipTemplateComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    ItemSelectorModule,
    ToastrModule,
    IconModule,
    TranslateModule,
  ],
  exports: [CreatureEquipTemplateComponent],
  providers: [CreatureEquipTemplateService],
})
export class CreatureEquipTemplateModule {}

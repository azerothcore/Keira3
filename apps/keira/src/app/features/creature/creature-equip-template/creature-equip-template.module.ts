import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { ToastrModule } from 'ngx-toastr';
import { CreatureEquipTemplateComponent } from './creature-equip-template.component';
import { CreatureEquipTemplateService } from './creature-equip-template.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, ToastrModule, TranslateModule, CreatureEquipTemplateComponent],
  exports: [CreatureEquipTemplateComponent],
  providers: [CreatureEquipTemplateService],
})
export class CreatureEquipTemplateModule {}

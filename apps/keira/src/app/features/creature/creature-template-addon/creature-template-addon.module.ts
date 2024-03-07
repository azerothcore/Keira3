import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureTemplateAddonComponent } from './creature-template-addon.component';
import { CreatureTemplateAddonService } from './creature-template-addon.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, ToastrModule, TranslateModule, CreatureTemplateAddonComponent],
  exports: [CreatureTemplateAddonComponent],
  providers: [CreatureTemplateAddonService],
})
export class CreatureTemplateAddonModule {}

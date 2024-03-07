import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureTemplateComponent } from './creature-template.component';
import { CreatureTemplateService } from './creature-template.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, ToastrModule, TranslateModule, CreatureTemplateComponent],
  exports: [CreatureTemplateComponent],
  providers: [CreatureTemplateService],
})
export class CreatureTemplateModule {}

import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureTemplateMovementComponent } from './creature-template-movement.component';
import { CreatureTemplateMovementService } from './creature-template-movement.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, ToastrModule, TranslateModule, CreatureTemplateMovementComponent],
  exports: [CreatureTemplateMovementComponent],
  providers: [CreatureTemplateMovementService],
})
export class CreatureTemplateMovementModule {}

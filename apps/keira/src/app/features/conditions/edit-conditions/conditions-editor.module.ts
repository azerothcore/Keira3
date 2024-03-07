import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { ConditionsComponent } from './conditions.component';
import { ConditionsService } from './conditions.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, ToastrModule, TranslateModule, ConditionsComponent],
  exports: [ConditionsComponent],
  providers: [ConditionsService],
})
export class ConditionsEditorModule {}

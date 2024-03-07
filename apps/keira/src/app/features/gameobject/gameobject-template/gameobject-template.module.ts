import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { GameobjectTemplateComponent } from './gameobject-template.component';
import { GameobjectTemplateService } from './gameobject-template.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, ToastrModule, TranslateModule, GameobjectTemplateComponent],
  exports: [GameobjectTemplateComponent],
  providers: [GameobjectTemplateService],
})
export class GameobjectTemplateModule {}

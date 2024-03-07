import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { GameobjectTemplateAddonComponent } from './gameobject-template-addon.component';
import { GameobjectTemplateAddonService } from './gameobject-template-addon.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, ToastrModule, TranslateModule, GameobjectTemplateAddonComponent],
  exports: [GameobjectTemplateAddonComponent],
  providers: [GameobjectTemplateAddonService],
})
export class GameobjectTemplateAddonModule {}

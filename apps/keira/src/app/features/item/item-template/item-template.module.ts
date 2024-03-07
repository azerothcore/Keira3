import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { ItemPreviewService } from './item-preview.service';
import { ItemTemplateComponent } from './item-template.component';
import { ItemTemplateService } from './item-template.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, ToastrModule, TranslateModule, ItemTemplateComponent],
  exports: [ItemTemplateComponent],
  providers: [ItemTemplateService, ItemPreviewService],
})
export class ItemTemplateModule {}

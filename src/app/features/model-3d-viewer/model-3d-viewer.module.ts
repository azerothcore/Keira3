import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { Model3DViewerComponent } from './model-3d-viewer.component';

@NgModule({
  declarations: [Model3DViewerComponent],
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, PerfectScrollbarModule, TranslateModule],
  exports: [Model3DViewerComponent],
})
export class Model3DViewerModule {}

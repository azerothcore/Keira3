import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectGameobjectComponent } from './select-gameobject.component';
import { SelectGameobjectService } from './select-gameobject.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, TranslateModule, SelectGameobjectComponent],
  exports: [SelectGameobjectComponent],
  providers: [SelectGameobjectService],
})
export class SelectGameobjectModule {}

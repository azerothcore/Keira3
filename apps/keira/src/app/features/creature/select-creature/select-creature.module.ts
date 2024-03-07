import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SelectCreatureComponent } from './select-creature.component';
import { SelectCreatureService } from './select-creature.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, TranslateModule, SelectCreatureComponent],
  exports: [SelectCreatureComponent],
  providers: [SelectCreatureService],
})
export class SelectCreatureModule {}

import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureSpawnComponent } from './creature-spawn.component';
import { CreatureSpawnService } from './creature-spawn.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, ToastrModule, NgxDatatableModule, TranslateModule, CreatureSpawnComponent],
  exports: [CreatureSpawnComponent],
  providers: [CreatureSpawnService],
})
export class CreatureSpawnModule {}

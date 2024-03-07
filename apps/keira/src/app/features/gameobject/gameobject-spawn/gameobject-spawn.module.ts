import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { GameobjectSpawnComponent } from './gameobject-spawn.component';
import { GameobjectSpawnService } from './gameobject-spawn.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, TooltipModule, ToastrModule, NgxDatatableModule, TranslateModule, GameobjectSpawnComponent],
  exports: [GameobjectSpawnComponent],
  providers: [GameobjectSpawnService],
})
export class GameobjectSpawnModule {}

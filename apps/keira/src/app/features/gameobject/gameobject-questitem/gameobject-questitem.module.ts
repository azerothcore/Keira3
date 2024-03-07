import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ToastrModule } from 'ngx-toastr';
import { GameobjectQuestitemComponent } from './gameobject-questitem.component';
import { GameobjectQuestitemService } from './gameobject-questitem.service';

@NgModule({
  imports: [BrowserModule, ReactiveFormsModule, NgxDatatableModule, ToastrModule, TranslateModule, GameobjectQuestitemComponent],
  exports: [GameobjectQuestitemComponent],
  providers: [GameobjectQuestitemService],
})
export class GameobjectQuestitemModule {}

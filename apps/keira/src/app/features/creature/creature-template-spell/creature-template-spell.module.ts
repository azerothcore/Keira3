import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureTemplateSpellComponent } from './creature-template-spell.component';
import { CreatureTemplateSpellService } from './creature-template-spell.service';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    TranslateModule,
    CreatureTemplateSpellComponent,
  ],
  exports: [CreatureTemplateSpellComponent],
  providers: [CreatureTemplateSpellService],
})
export class CreatureTemplateSpellModule {}

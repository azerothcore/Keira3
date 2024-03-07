import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureTemplateResistanceComponent } from './creature-template-resistance.component';
import { CreatureTemplateResistanceService } from './creature-template-resistance.service';

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TooltipModule,
    ToastrModule,
    NgxDatatableModule,
    TranslateModule,
    CreatureTemplateResistanceComponent,
  ],
  exports: [CreatureTemplateResistanceComponent],
  providers: [CreatureTemplateResistanceService],
})
export class CreatureTemplateResistanceModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { CreatureQueststarterComponent } from './creature-queststarter.component';
import { TooltipModule } from 'ngx-bootstrap';

@NgModule({
  declarations: [
    CreatureQueststarterComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    NgxDatatableModule,
    TooltipModule.forRoot(),
  ],
  exports: [
    CreatureQueststarterComponent,
  ],
})
export class CreatureQueststarterModule {}

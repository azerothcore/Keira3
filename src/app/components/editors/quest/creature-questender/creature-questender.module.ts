import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { CreatureQuestenderComponent } from './creature-questender.component';
import { TooltipModule } from 'ngx-bootstrap';
import { CreatureSelectorModule } from '../../shared/selectors/creature-selector/creature-selector.module';

@NgModule({
  declarations: [
    CreatureQuestenderComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    NgxDatatableModule,
    TooltipModule.forRoot(),
    CreatureSelectorModule,
  ],
  exports: [
    CreatureQuestenderComponent,
  ],
})
export class CreatureQuestenderModule {}

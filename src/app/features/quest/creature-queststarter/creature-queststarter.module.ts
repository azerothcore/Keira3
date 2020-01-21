import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '../../../config/toastr.config';

import { TopBarModule } from '../../../shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '../../../shared/modules/query-output/query-output.module';
import { CreatureQueststarterComponent } from './creature-queststarter.component';
import { CreatureSelectorModule } from '../../../shared/modules/selectors/creature-selector/creature-selector.module';

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
    ToastrModule.forRoot(toastrConfig),
    CreatureSelectorModule,
  ],
  exports: [
    CreatureQueststarterComponent,
  ],
})
export class CreatureQueststarterModule {}

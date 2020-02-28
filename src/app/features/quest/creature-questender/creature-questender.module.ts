import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { CreatureQuestenderComponent } from './creature-questender.component';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
import { CreatureSelectorModule } from '@keira-shared/modules/selectors/creature-selector/creature-selector.module';
import { CreatureQuestenderService } from './creature-questender.service';

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
    ToastrModule.forRoot(toastrConfig),
    CreatureSelectorModule,
  ],
  exports: [
    CreatureQuestenderComponent,
  ],
  providers: [
    CreatureQuestenderService,
  ],
})
export class CreatureQuestenderModule {}

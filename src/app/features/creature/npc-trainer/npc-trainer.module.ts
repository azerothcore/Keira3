import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { NpcTrainerComponent } from './npc-trainer.component';
import { NpcTrainerService } from './npc-trainer.service';
import { SpellSelectorModule } from '@keira-shared/modules/selectors/spell-selector/spell-selector.module';

@NgModule({
  declarations: [
    NpcTrainerComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    NgxDatatableModule,
    SpellSelectorModule,
  ],
  exports: [
    NpcTrainerComponent,
  ],
  providers: [
    NpcTrainerService,
  ],
})
export class NpcTrainerModule {}

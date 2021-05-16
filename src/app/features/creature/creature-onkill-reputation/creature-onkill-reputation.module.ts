import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { CreatureOnkillReputationComponent } from './creature-onkill-reputation.component';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { CreatureOnkillReputationService } from './creature-onkill-reputation.service';
import { FactionSelectorModule } from '@keira-shared/modules/selectors/faction-selector/faction-selector.module';

@NgModule({
  declarations: [CreatureOnkillReputationComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    SingleValueSelectorModule,
    FactionSelectorModule,
  ],
  exports: [CreatureOnkillReputationComponent],
  providers: [CreatureOnkillReputationService],
})
export class CreatureOnkillReputationModule {}

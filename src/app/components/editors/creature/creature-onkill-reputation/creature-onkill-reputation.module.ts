import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '../../../../config/toastr.config';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { CreatureOnkillReputationComponent } from './creature-onkill-reputation.component';
import { SingleValueSelectorModule } from '../../shared/selectors/single-value-selector/single-value-selector.module';

@NgModule({
  declarations: [
    CreatureOnkillReputationComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    SingleValueSelectorModule,
  ],
  exports: [
    CreatureOnkillReputationComponent,
  ],
})
export class CreatureOnkillReputationModule {}

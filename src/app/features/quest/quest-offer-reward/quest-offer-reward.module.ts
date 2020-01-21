import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '../../../config/toastr.config';

import { TopBarModule } from '../../../shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '../../../shared/modules/query-output/query-output.module';
import { QuestOfferRewardComponent } from './quest-offer-reward.component';
import { FlagsSelectorModule } from '../../../shared/modules/selectors/flags-selector/flags-selector.module';
import { SingleValueSelectorModule } from '../../../shared/modules/selectors/single-value-selector/single-value-selector.module';

@NgModule({
  declarations: [
    QuestOfferRewardComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    FlagsSelectorModule,
    SingleValueSelectorModule,
  ],
  exports: [
    QuestOfferRewardComponent,
  ],
})
export class QuestOfferRewardModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';

import { TopBarModule } from '../../shared/top-bar/top-bar.module';
import { QueryOutputModule } from '../../shared/query-output/query-output.module';
import { QuestOfferRewardComponent } from './quest-offer-reward.component';
import { FlagsSelectorModule } from '../../shared/selectors/flags-selector/flags-selector.module';
import { SingleValueSelectorModule } from '../../shared/selectors/single-value-selector/single-value-selector.module';

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
    FlagsSelectorModule,
    SingleValueSelectorModule,
  ],
  exports: [
    QuestOfferRewardComponent,
  ],
})
export class QuestOfferRewardModule {}

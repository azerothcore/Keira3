import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { FactionSelectorModule } from '@keira-shared/modules/selectors/faction-selector/faction-selector.module';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureOnkillReputationComponent } from './creature-onkill-reputation.component';
import { CreatureOnkillReputationService } from './creature-onkill-reputation.service';

@NgModule({
  declarations: [CreatureOnkillReputationComponent],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule,
    ToastrModule,
    SingleValueSelectorModule,
    FactionSelectorModule,
  ],
  exports: [CreatureOnkillReputationComponent],
  providers: [CreatureOnkillReputationService],
})
export class CreatureOnkillReputationModule {}

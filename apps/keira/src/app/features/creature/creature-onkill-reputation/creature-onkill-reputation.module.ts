import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { FactionSelectorModule, QueryOutputModule, SingleValueSelectorModule, TopBarModule } from '@keira/shared/core';
import { TranslateModule } from '@ngx-translate/core';
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
    TranslateModule,
  ],
  exports: [CreatureOnkillReputationComponent],
  providers: [CreatureOnkillReputationService],
})
export class CreatureOnkillReputationModule {}

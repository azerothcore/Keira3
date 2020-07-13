import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { CreatureTemplateComponent } from './creature-template.component';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { CreatureTemplateService } from './creature-template.service';
import { SpellSelectorModule } from '@keira-shared/modules/selectors/spell-selector/spell-selector.module';
import { FactionSelectorModule } from '@keira-shared/modules/selectors/faction-selector/faction-selector.module';
import { CreatureSelectorModule } from '@keira-shared/modules/selectors/creature-selector/creature-selector.module';

@NgModule({
  declarations: [
    CreatureTemplateComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    SingleValueSelectorModule,
    FlagsSelectorModule,
    SpellSelectorModule,
    FactionSelectorModule,
    CreatureSelectorModule,
  ],
  exports: [
    CreatureTemplateComponent,
  ],
  providers: [
    CreatureTemplateService,
  ],
})
export class CreatureTemplateModule { }

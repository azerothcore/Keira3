import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';

import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { QuestTemplateAddonComponent } from './quest-template-addon.component';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { QuestTemplateAddonService } from './quest-template-addon.service';
import { SpellSelectorModule } from '@keira-shared/modules/selectors/spell-selector/spell-selector.module';
import { FactionSelectorModule } from '@keira-shared/modules/selectors/faction-selector/faction-selector.module';
import { SkillSelectorModule } from '@keira-shared/modules/selectors/skill-selector/skill-selector.module';

@NgModule({
  declarations: [
    QuestTemplateAddonComponent,
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
    SpellSelectorModule,
    FactionSelectorModule,
    SkillSelectorModule,
  ],
  exports: [
    QuestTemplateAddonComponent,
  ],
  providers: [
    QuestTemplateAddonService,
  ],
})
export class QuestTemplateAddonModule {}

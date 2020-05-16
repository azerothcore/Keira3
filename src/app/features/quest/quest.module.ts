import { NgModule } from '@angular/core';

import { SelectQuestModule } from './select-quest/select-quest.module';
import { QuestHandlerService } from './quest-handler.service';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { TopBarModule } from '@keira-shared/modules/top-bar/top-bar.module';
import { QueryOutputModule } from '@keira-shared/modules/query-output/query-output.module';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { toastrConfig } from '@keira-config/toastr.config';
import { CreatureSelectorModule } from '@keira-shared/modules/selectors/creature-selector/creature-selector.module';
import { EditorButtonsModule } from '@keira-shared/modules/editor-buttons/editor-buttons.module';
import { CreatureQuestenderComponent } from './creature-questender/creature-questender.component';
import { CreatureQuestenderService } from './creature-questender/creature-questender.service';
import { CreatureQueststarterComponent } from './creature-queststarter/creature-queststarter.component';
import { CreatureQueststarterService } from './creature-queststarter/creature-queststarter.service';
import { GameobjectSelectorModule } from '@keira-shared/modules/selectors/gameobject-selector/gameobject-selector.module';
import { GameobjectQueststarterComponent } from './gameobject-queststarter/gameobject-queststarter.component';
import { GameobjectQueststarterService } from './gameobject-queststarter/gameobject-queststarter.service';
import { FlagsSelectorModule } from '@keira-shared/modules/selectors/flags-selector/flags-selector.module';
import { SingleValueSelectorModule } from '@keira-shared/modules/selectors/single-value-selector/single-value-selector.module';
import { QuestOfferRewardService } from './quest-offer-reward/quest-offer-reward.service';
import { QuestOfferRewardComponent } from './quest-offer-reward/quest-offer-reward.component';
import { QuestPreviewComponent } from './quest-preview/quest-preview.component';
import { QuestPreviewService } from './quest-preview/quest-preview.service';
import { QuestRequestItemsComponent } from './quest-request-items/quest-request-items.component';
import { QuestRequestItemsService } from './quest-request-items/quest-request-items.service';
import { QuestTemplateComponent } from './quest-template/quest-template.component';
import { QuestTemplateService } from './quest-template/quest-template.service';
import { QuestTemplateAddonComponent } from './quest-template-addon/quest-template-addon.component';
import { QuestTemplateAddonService } from './quest-template-addon/quest-template-addon.service';
import { SpellSelectorModule } from '@keira-shared/modules/selectors/spell-selector/spell-selector.module';
import { FactionSelectorModule } from '@keira-shared/modules/selectors/faction-selector/faction-selector.module';
import { SkillSelectorModule } from '@keira-shared/modules/selectors/skill-selector/skill-selector.module';
import { QuestSelectorModule } from '@keira-shared/modules/selectors/quest-selector/quest-selector.module';
import { IconModule } from '@keira-shared/modules/icon/icon.module';
import { GameobjectQuestenderService } from './gameobject-questender/gameobject-questender.service';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { ItemSelectorModule } from '@keira-shared/modules/selectors/item-selector/item-selector.module';
import { GameobjectQuestenderComponent } from './gameobject-questender/gameobject-questender.component';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

const components = [
  CreatureQuestenderComponent,
  CreatureQueststarterComponent,
  GameobjectQueststarterComponent,
  GameobjectQuestenderComponent,
  QuestOfferRewardComponent,
  QuestRequestItemsComponent,
  QuestTemplateComponent,
  QuestPreviewComponent,
  QuestTemplateAddonComponent,
];

@NgModule({
  declarations: components,
  exports: components,
  imports: [
    SelectQuestModule,
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    TopBarModule,
    QueryOutputModule,
    NgxDatatableModule,
    TooltipModule.forRoot(),
    ToastrModule.forRoot(toastrConfig),
    EditorButtonsModule,
    CreatureSelectorModule,
    GameobjectSelectorModule,
    FlagsSelectorModule,
    SingleValueSelectorModule,
    SpellSelectorModule,
    FactionSelectorModule,
    SkillSelectorModule,
    QuestSelectorModule,
    ItemSelectorModule,
    IconModule,
    PerfectScrollbarModule,
    CollapseModule,
  ],
  providers: [
    QuestHandlerService,
    QuestPreviewService,
    CreatureQuestenderService,
    CreatureQueststarterService,
    GameobjectQueststarterService,
    GameobjectQuestenderService,
    QuestRequestItemsService,
    QuestOfferRewardService,
    QuestTemplateService,
    QuestTemplateAddonService,
  ],
})
export class QuestModule {}

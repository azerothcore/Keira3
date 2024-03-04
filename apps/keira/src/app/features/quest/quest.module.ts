import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  CreatureSelectorModule,
  EditorButtonsModule,
  FactionSelectorModule,
  FlagsSelectorModule,
  GameobjectSelectorModule,
  IconModule,
  ItemSelectorModule,
  QueryOutputModule,
  QuestSelectorModule,
  SingleValueSelectorModule,
  SkillSelectorModule,
  SpellSelectorModule,
  TopBarModule,
} from '@keira/core';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ToastrModule } from 'ngx-toastr';
import { CreatureQuestenderComponent } from './creature-questender/creature-questender.component';
import { CreatureQuestenderService } from './creature-questender/creature-questender.service';
import { CreatureQueststarterComponent } from './creature-queststarter/creature-queststarter.component';
import { CreatureQueststarterService } from './creature-queststarter/creature-queststarter.service';
import { GameobjectQuestenderComponent } from './gameobject-questender/gameobject-questender.component';
import { GameobjectQuestenderService } from './gameobject-questender/gameobject-questender.service';
import { GameobjectQueststarterComponent } from './gameobject-queststarter/gameobject-queststarter.component';
import { GameobjectQueststarterService } from './gameobject-queststarter/gameobject-queststarter.service';
import { QuestHandlerService } from './quest-handler.service';
import { QuestOfferRewardComponent } from './quest-offer-reward/quest-offer-reward.component';
import { QuestOfferRewardService } from './quest-offer-reward/quest-offer-reward.service';
import { QuestPreviewComponent } from './quest-preview/quest-preview.component';
import { QuestPreviewService } from './quest-preview/quest-preview.service';
import { QuestRequestItemsComponent } from './quest-request-items/quest-request-items.component';
import { QuestRequestItemsService } from './quest-request-items/quest-request-items.service';
import { QuestTemplateAddonComponent } from './quest-template-addon/quest-template-addon.component';
import { QuestTemplateAddonService } from './quest-template-addon/quest-template-addon.service';
import { QuestTemplateComponent } from './quest-template/quest-template.component';
import { QuestTemplateService } from './quest-template/quest-template.service';
import { SelectQuestModule } from './select-quest/select-quest.module';

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
    TooltipModule,
    ToastrModule,
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
    CollapseModule,
    TranslateModule,
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

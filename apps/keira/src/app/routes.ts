import { Routes } from '@angular/router';

import { DashboardComponent } from '@keira/features/dashboard';
import { SettingsComponent } from '@keira/features/settings';
import {
  SaiWaypointsComponent,
  SaiWaypointsHandlerService,
  SelectSaiWaypointsComponent,
  SelectWaypointComponent,
  SelectWaypointScriptsComponent,
  WaypointDataAddonComponent,
  WaypointDataComponent,
  WaypointHandlerService,
  WaypointScriptsComponent,
  WaypointScriptsHandlerService,
} from '@keira/features/waypoints';
import {
  GameEventPoolComponent,
  PoolCreatureComponent,
  PoolGameobjectComponent,
  PoolHandlerService,
  PoolPoolComponent,
  PoolQuestComponent,
  PoolTemplateComponent,
  SelectPoolComponent,
} from '@keira/features/pools';
import {
  BossBoundariesComponent,
  ScriptNamesComponent,
  ScriptSpawnsComponent,
  ScriptTemplateComponent,
  ScriptWaypointComponent,
  ScriptWaypointHandlerService,
  SelectScriptWaypointComponent,
} from '@keira/features/scripts';

import {
  ConditionsComponent,
  ConditionsHandlerService,
  ConditionsSourceComponent,
  ConditionsSourceHandlerService,
  SelectConditionsComponent,
} from '@keira/features/conditions';
import {
  CreatureCopyComponent,
  CreatureEquipTemplateComponent,
  CreatureFormationsComponent,
  CreatureHandlerService,
  CreatureLootTemplateComponent,
  CreatureOnkillReputationComponent,
  CreatureQuestitemComponent,
  CreatureSpawnAddonComponent,
  CreatureSpawnComponent,
  CreatureTemplateAddonComponent,
  CreatureTemplateComponent,
  CreatureTemplateModelComponent,
  CreatureTemplateMovementComponent,
  CreatureTemplateResistanceComponent,
  CreatureTemplateSpellComponent,
  CreatureTextComponent,
  CreatureDefaultTrainerComponent,
  NpcVendorComponent,
  PickpocketingLootTemplateComponent,
  SaiCreatureComponent,
  SelectCreatureComponent,
  SkinningLootTemplateComponent,
  CreatureTemplateLocaleComponent,
  CreatureTextLocaleComponent,
  NpcSpellclickSpellsComponent,
  VehicleTemplateAccessoryComponent,
} from '@keira/features/creature';
import {
  GameobjectHandlerService,
  GameobjectCopyComponent,
  GameobjectLootTemplateComponent,
  GameobjectQuestitemComponent,
  GameobjectSpawnAddonComponent,
  GameobjectSpawnComponent,
  GameobjectTemplateAddonComponent,
  GameobjectTemplateComponent,
  SaiGameobjectComponent,
  SelectGameobjectComponent,
  GameobjectTemplateLocaleComponent,
} from '@keira/features/gameobject';
import {
  GossipHandlerService,
  GossipMenuComponent,
  GossipMenuOptionComponent,
  SelectGossipComponent,
  GossipCopyComponent,
  GossipMenuOptionLocaleComponent,
} from '@keira/features/gossip';
import {
  DisenchantLootTemplateComponent,
  ItemEnchantmentTemplateComponent,
  ItemHandlerService,
  ItemCopyComponent,
  ItemLootTemplateComponent,
  ItemSourcesComponent,
  ItemTemplateComponent,
  MillingLootTemplateComponent,
  ProspectingLootTemplateComponent,
  SelectItemComponent,
  ItemTemplateLocaleComponent,
} from '@keira/features/item';
import {
  FishingLootHandlerService,
  FishingLootTemplateComponent,
  MailLootHandlerService,
  MailLootTemplateComponent,
  FishingLootCopyComponent,
  SpellLootCopyComponent,
  MailLootCopyComponent,
  ReferenceLootCopyComponent,
  ReferenceLootHandlerService,
  ReferenceLootTemplateComponent,
  SelectFishingLootComponent,
  SelectMailLootComponent,
  SelectReferenceLootComponent,
  SelectSpellLootComponent,
  SpellLootHandlerService,
  SpellLootTemplateComponent,
} from '@keira/features/other-loots';
import {
  CreatureQuestenderComponent,
  CreatureQueststarterComponent,
  GameobjectQuestenderComponent,
  GameobjectQueststarterComponent,
  QuestChainComponent,
  QuestHandlerService,
  QuestOfferRewardComponent,
  QuestRequestItemsComponent,
  QuestTemplateAddonComponent,
  QuestTemplateLocaleComponent,
  QuestRequestItemsLocaleComponent,
  QuestOfferRewardLocaleComponent,
  QuestTemplateComponent,
  SelectQuestComponent,
  QuestCopyComponent,
} from '@keira/features/quest';
import { SaiFullEditorComponent, SaiSearchEntityComponent, SaiSearchExistingComponent } from '@keira/features/smart-scripts';
import {
  SelectSpellComponent,
  SpellDbcComponent,
  SpellCopyComponent,
  SpellHandlerService,
  SpellAreaComponent,
} from '@keira/features/spell';
import { FindAnywhereComponent, SessionSqlComponent, SqlEditorComponent, TableBrowserComponent } from '@keira/features/sql-editor';
import { SaiHandlerService } from '@keira/shared/sai-editor';
import {
  BroadcastTextComponent,
  BroadcastTextHandlerService,
  NpcTextComponent,
  NpcTextHandlerService,
  PageTextComponent,
  PageTextHandlerService,
  PageTextCopyComponent,
  NpcTextCopyComponent,
  SelectBroadcastTextComponent,
  SelectNpcTextComponent,
  SelectPageTextComponent,
  AcoreStringComponent,
  AcoreStringHandlerService,
  AcoreStringCopyComponent,
  SelectAcoreStringComponent,
  PageTextLocaleComponent,
  NpcTextLocaleComponent,
  BroadcastTextLocaleComponent,
} from '@keira/features/texts';
import { GameTeleComponent, GameTeleCopyComponent, GameTeleHandlerService, SelectGameTeleComponent } from '@keira/features/game-tele';
import {
  CreatureImmunitiesComponent,
  CreatureImmunitiesHandlerService,
  SelectCreatureImmunitiesComponent,
} from '@keira/features/creature-immunities';
import {
  SelectTrainerComponent,
  TrainerComponent,
  TrainerCopyComponent,
  TrainerHandlerService,
  TrainerSpellComponent,
} from '@keira/features/trainer';
import {
  GameEventHandlerService,
  SelectGameEventComponent,
  GameEventComponent,
  GameEventCreatureComponent,
  GameEventCreatureRemovedComponent,
  GameEventGameobjectComponent,
  GameEventGameobjectRemovedComponent,
  GameEventSpawnedPoolsComponent,
  GameEventPrerequisiteComponent,
  GameEventNpcflagComponent,
  GameEventModelEquipComponent,
  GameEventNpcVendorComponent,
  GameEventCreatureQuestComponent,
  GameEventGameobjectQuestComponent,
  GameEventSeasonalQuestComponent,
  GameEventBattlegroundHolidayComponent,
} from '@keira/features/game-events';
import { DisablesHandlerService, SelectDisablesComponent, DisablesComponent } from '@keira/features/disables';
import {
  AreaTriggerHandlerService,
  SelectAreaTriggerComponent,
  AreatriggerTeleportComponent,
  AreatriggerTavernComponent,
  AreatriggerInvolvedrelationComponent,
  AreatriggerScriptsComponent,
  AreatriggerComponent,
} from '@keira/features/area-triggers';
import {
  EventScriptsComponent,
  EventScriptsHandlerService,
  SelectEventScriptsComponent,
  SelectSpellScriptsComponent,
  SpellScriptsComponent,
  SpellScriptsHandlerService,
} from '@keira/features/db-scripts';
import { UnusedGuidSearchComponent } from '@keira/features/unused-guid-search';
import { WORLD_EDITOR_LINKS } from '@keira/shared/constants';
import { worldEditorLinks } from './world-editor-links';

export const KEIRA_ROUTES: Routes = [
  {
    path: '',
    component: DashboardComponent,
  },
  {
    path: 'sql-editor',
    component: SqlEditorComponent,
  },
  {
    path: 'session-sql',
    component: SessionSqlComponent,
  },
  {
    path: 'table-browser',
    component: TableBrowserComponent,
  },
  {
    path: 'find-anywhere',
    component: FindAnywhereComponent,
  },
  {
    path: 'creature',
    children: [
      {
        path: 'vehicle-template-accessory',
        component: VehicleTemplateAccessoryComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'npc-spellclick-spells',
        component: NpcSpellclickSpellsComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-text-locale',
        component: CreatureTextLocaleComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-template-locale',
        component: CreatureTemplateLocaleComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'select',
        component: SelectCreatureComponent,
      },
      {
        path: 'copy',
        component: CreatureCopyComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-template',
        component: CreatureTemplateComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-template-addon',
        component: CreatureTemplateAddonComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-template-model',
        component: CreatureTemplateModelComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-template-resistance',
        component: CreatureTemplateResistanceComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-template-spell',
        component: CreatureTemplateSpellComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-template-movement',
        component: CreatureTemplateMovementComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-onkill-reputation',
        component: CreatureOnkillReputationComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-equip-template',
        component: CreatureEquipTemplateComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'npc-vendor',
        component: NpcVendorComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-questitem',
        component: CreatureQuestitemComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-loot-template',
        component: CreatureLootTemplateComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'pickpocketing-loot-template',
        component: PickpocketingLootTemplateComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'skinning-loot-template',
        component: SkinningLootTemplateComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-default-trainer',
        component: CreatureDefaultTrainerComponent,
        canActivate: [CreatureHandlerService],
      },

      {
        path: 'creature-spawn',
        component: CreatureSpawnComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-spawn-addon',
        component: CreatureSpawnAddonComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'sai-creature',
        component: SaiCreatureComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-text',
        component: CreatureTextComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'creature-formations',
        component: CreatureFormationsComponent,
        canActivate: [CreatureHandlerService],
      },
    ],
  },
  {
    path: 'quest',
    children: [
      {
        path: 'select',
        component: SelectQuestComponent,
      },
      {
        path: 'quest-template',
        component: QuestTemplateComponent,
        canActivate: [QuestHandlerService],
      },
      {
        path: 'copy',
        component: QuestCopyComponent,
        canActivate: [QuestHandlerService],
      },
      {
        path: 'quest-template-addon',
        component: QuestTemplateAddonComponent,
        canActivate: [QuestHandlerService],
      },
      {
        path: 'quest-template-locale',
        component: QuestTemplateLocaleComponent,
        canActivate: [QuestHandlerService],
      },
      {
        path: 'quest-offer-reward-locale',
        component: QuestOfferRewardLocaleComponent,
        canActivate: [QuestHandlerService],
      },
      {
        path: 'quest-request-items-locale',
        component: QuestRequestItemsLocaleComponent,
        canActivate: [QuestHandlerService],
      },
      {
        path: 'quest-offer-reward',
        component: QuestOfferRewardComponent,
        canActivate: [QuestHandlerService],
      },
      {
        path: 'quest-request-items',
        component: QuestRequestItemsComponent,
        canActivate: [QuestHandlerService],
      },
      {
        path: 'creature-queststarter',
        component: CreatureQueststarterComponent,
        canActivate: [QuestHandlerService],
      },
      {
        path: 'creature-questender',
        component: CreatureQuestenderComponent,
        canActivate: [QuestHandlerService],
      },
      {
        path: 'gameobject-queststarter',
        component: GameobjectQueststarterComponent,
        canActivate: [QuestHandlerService],
      },
      {
        path: 'gameobject-questender',
        component: GameobjectQuestenderComponent,
        canActivate: [QuestHandlerService],
      },
      {
        path: 'quest-chain',
        component: QuestChainComponent,
        canActivate: [QuestHandlerService],
      },
    ],
  },
  {
    path: 'gameobject',
    children: [
      {
        path: 'gameobject-template-locale',
        component: GameobjectTemplateLocaleComponent,
        canActivate: [GameobjectHandlerService],
      },
      {
        path: 'select',
        component: SelectGameobjectComponent,
      },
      {
        path: 'gameobject-template',
        component: GameobjectTemplateComponent,
        canActivate: [GameobjectHandlerService],
      },
      {
        path: 'copy',
        component: GameobjectCopyComponent,
        canActivate: [GameobjectHandlerService],
      },
      {
        path: 'gameobject-template-addon',
        component: GameobjectTemplateAddonComponent,
        canActivate: [GameobjectHandlerService],
      },
      {
        path: 'gameobject-questitem',
        component: GameobjectQuestitemComponent,
        canActivate: [GameobjectHandlerService],
      },
      {
        path: 'gameobject-loot-template',
        component: GameobjectLootTemplateComponent,
        canActivate: [GameobjectHandlerService],
      },
      {
        path: 'gameobject-spawn',
        component: GameobjectSpawnComponent,
        canActivate: [GameobjectHandlerService],
      },
      {
        path: 'gameobject-spawn-addon',
        component: GameobjectSpawnAddonComponent,
        canActivate: [GameobjectHandlerService],
      },
      {
        path: 'sai-gameobject',
        component: SaiGameobjectComponent,
        canActivate: [GameobjectHandlerService],
      },
    ],
  },
  {
    path: 'item',
    children: [
      {
        path: 'item-template-locale',
        component: ItemTemplateLocaleComponent,
        canActivate: [ItemHandlerService],
      },
      {
        path: 'select',
        component: SelectItemComponent,
      },
      {
        path: 'item-template',
        component: ItemTemplateComponent,
        canActivate: [ItemHandlerService],
      },
      {
        path: 'copy',
        component: ItemCopyComponent,
        canActivate: [ItemHandlerService],
      },
      {
        path: 'item-enchantment-template',
        component: ItemEnchantmentTemplateComponent,
        canActivate: [ItemHandlerService],
      },
      {
        path: 'item-loot-template',
        component: ItemLootTemplateComponent,
        canActivate: [ItemHandlerService],
      },
      {
        path: 'item-sources',
        component: ItemSourcesComponent,
        canActivate: [ItemHandlerService],
      },
      {
        path: 'disenchant-loot-template',
        component: DisenchantLootTemplateComponent,
        canActivate: [ItemHandlerService],
      },
      {
        path: 'prospecting-loot-template',
        component: ProspectingLootTemplateComponent,
        canActivate: [ItemHandlerService],
      },
      {
        path: 'milling-loot-template',
        component: MillingLootTemplateComponent,
        canActivate: [ItemHandlerService],
      },
    ],
  },
  {
    path: 'other-loots',
    children: [
      {
        path: 'select-reference',
        component: SelectReferenceLootComponent,
      },
      {
        path: 'reference',
        component: ReferenceLootTemplateComponent,
        canActivate: [ReferenceLootHandlerService],
      },
      {
        path: 'reference-copy',
        component: ReferenceLootCopyComponent,
        canActivate: [ReferenceLootHandlerService],
      },
      {
        path: 'spell-copy',
        component: SpellLootCopyComponent,
        canActivate: [SpellLootHandlerService],
      },
      {
        path: 'select-spell',
        component: SelectSpellLootComponent,
      },
      {
        path: 'spell',
        component: SpellLootTemplateComponent,
        canActivate: [SpellLootHandlerService],
      },
      {
        path: 'select-fishing',
        component: SelectFishingLootComponent,
      },
      {
        path: 'fishing',
        component: FishingLootTemplateComponent,
        canActivate: [FishingLootHandlerService],
      },
      {
        path: 'fishing-copy',
        component: FishingLootCopyComponent,
        canActivate: [FishingLootHandlerService],
      },
      {
        path: 'select-mail',
        component: SelectMailLootComponent,
      },
      {
        path: 'mail',
        component: MailLootTemplateComponent,
        canActivate: [MailLootHandlerService],
      },
      {
        path: 'mail-copy',
        component: MailLootCopyComponent,
        canActivate: [MailLootHandlerService],
      },
    ],
  },
  {
    path: 'texts',
    children: [
      {
        path: 'broadcast-text-locale',
        component: BroadcastTextLocaleComponent,
        canActivate: [BroadcastTextHandlerService],
      },
      {
        path: 'npc-text-locale',
        component: NpcTextLocaleComponent,
        canActivate: [NpcTextHandlerService],
      },
      {
        path: 'page-text-locale',
        component: PageTextLocaleComponent,
        canActivate: [PageTextHandlerService],
      },
      {
        path: 'select-page-text',
        component: SelectPageTextComponent,
      },
      {
        path: 'page-text-copy',
        component: PageTextCopyComponent,
        canActivate: [PageTextHandlerService],
      },
      {
        path: 'page-text',
        component: PageTextComponent,
        canActivate: [PageTextHandlerService],
      },
      {
        path: 'select-broadcast-text',
        component: SelectBroadcastTextComponent,
      },
      {
        path: 'broadcast-text',
        component: BroadcastTextComponent,
        canActivate: [BroadcastTextHandlerService],
      },
      {
        path: 'select-npc-text',
        component: SelectNpcTextComponent,
      },
      {
        path: 'npc-text-copy',
        component: NpcTextCopyComponent,
        canActivate: [NpcTextHandlerService],
      },
      {
        path: 'npc-text',
        component: NpcTextComponent,
        canActivate: [NpcTextHandlerService],
      },
      {
        path: 'acore-string',
        component: AcoreStringComponent,
        canActivate: [AcoreStringHandlerService],
      },
      {
        path: 'acore-string-copy',
        component: AcoreStringCopyComponent,
        canActivate: [AcoreStringHandlerService],
      },
      {
        path: 'select-acore-string',
        component: SelectAcoreStringComponent,
      },
    ],
  },
  {
    path: 'gossip',
    children: [
      {
        path: 'gossip-menu-option-locale',
        component: GossipMenuOptionLocaleComponent,
        canActivate: [GossipHandlerService],
      },
      {
        path: 'select',
        component: SelectGossipComponent,
      },
      {
        path: 'copy',
        component: GossipCopyComponent,
        canActivate: [GossipHandlerService],
      },
      {
        path: 'gossip-menu',
        component: GossipMenuComponent,
        canActivate: [GossipHandlerService],
      },
      {
        path: 'gossip-menu-option',
        component: GossipMenuOptionComponent,
        canActivate: [GossipHandlerService],
      },
    ],
  },
  {
    path: 'waypoints',
    children: [
      {
        path: 'select',
        component: SelectWaypointComponent,
      },
      {
        path: 'waypoint-data',
        component: WaypointDataComponent,
        canActivate: [WaypointHandlerService],
      },
      {
        path: 'select-scripts',
        component: SelectWaypointScriptsComponent,
      },
      {
        path: 'waypoint-scripts',
        component: WaypointScriptsComponent,
        canActivate: [WaypointScriptsHandlerService],
      },
      { path: 'waypoint-data-addon', component: WaypointDataAddonComponent, canActivate: [WaypointHandlerService] },
      { path: 'select-sai', component: SelectSaiWaypointsComponent },
      { path: 'sai-waypoints', component: SaiWaypointsComponent, canActivate: [SaiWaypointsHandlerService] },
    ],
  },
  {
    path: 'pools',
    children: [
      { path: 'select', component: SelectPoolComponent },
      { path: 'pool-template', component: PoolTemplateComponent, canActivate: [PoolHandlerService] },
      { path: 'pool-creature', component: PoolCreatureComponent, canActivate: [PoolHandlerService] },
      { path: 'pool-gameobject', component: PoolGameobjectComponent, canActivate: [PoolHandlerService] },
      { path: 'pool-pool', component: PoolPoolComponent, canActivate: [PoolHandlerService] },
      { path: 'pool-quest', component: PoolQuestComponent, canActivate: [PoolHandlerService] },
      { path: 'game-event-pool', component: GameEventPoolComponent, canActivate: [PoolHandlerService] },
    ],
  },
  {
    path: 'scripts',
    children: [
      { path: 'select-script-waypoint', component: SelectScriptWaypointComponent },
      { path: 'script-waypoint', component: ScriptWaypointComponent, canActivate: [ScriptWaypointHandlerService] },
      { path: 'script-names', component: ScriptNamesComponent },
      { path: 'boss-boundaries', component: BossBoundariesComponent },
      { path: 'script-spawns', component: ScriptSpawnsComponent },
      { path: 'script-template', component: ScriptTemplateComponent },
    ],
  },
  {
    path: 'conditions',
    children: [
      {
        path: 'select',
        component: SelectConditionsComponent,
      },
      {
        path: 'conditions',
        component: ConditionsComponent,
        canActivate: [ConditionsHandlerService],
      },
      {
        path: 'source',
        component: ConditionsSourceComponent,
        canActivate: [ConditionsSourceHandlerService],
      },
    ],
  },
  {
    path: 'smart-ai',
    children: [
      {
        path: 'search-existing',
        component: SaiSearchExistingComponent,
      },
      {
        path: 'search-entity',
        component: SaiSearchEntityComponent,
      },
      {
        path: 'editors',
        component: SaiFullEditorComponent,
        canActivate: [SaiHandlerService],
      },
    ],
  },
  {
    path: 'spell',
    children: [
      {
        path: 'spell-area',
        component: SpellAreaComponent,
        canActivate: [SpellHandlerService],
      },
      {
        path: 'select',
        component: SelectSpellComponent,
      },
      {
        path: 'spell-dbc',
        component: SpellDbcComponent,
      },
      {
        path: 'copy',
        component: SpellCopyComponent,
        canActivate: [SpellHandlerService],
      },
    ],
  },
  {
    path: 'game-tele',
    children: [
      {
        path: 'select',
        component: SelectGameTeleComponent,
      },
      {
        path: 'copy',
        component: GameTeleCopyComponent,
        canActivate: [GameTeleHandlerService],
      },
      {
        path: 'tele',
        component: GameTeleComponent,
        canActivate: [GameTeleHandlerService],
      },
    ],
  },
  {
    path: 'game-events',
    children: [
      {
        path: 'select',
        component: SelectGameEventComponent,
      },
      {
        path: 'game-event',
        component: GameEventComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-creature',
        component: GameEventCreatureComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-creature-removed',
        component: GameEventCreatureRemovedComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-gameobject',
        component: GameEventGameobjectComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-gameobject-removed',
        component: GameEventGameobjectRemovedComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-pool',
        component: GameEventSpawnedPoolsComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-prerequisite',
        component: GameEventPrerequisiteComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-npcflag',
        component: GameEventNpcflagComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-model-equip',
        component: GameEventModelEquipComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-npc-vendor',
        component: GameEventNpcVendorComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-creature-quest',
        component: GameEventCreatureQuestComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-gameobject-quest',
        component: GameEventGameobjectQuestComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-seasonal-quest',
        component: GameEventSeasonalQuestComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-battleground-holiday',
        component: GameEventBattlegroundHolidayComponent,
        canActivate: [GameEventHandlerService],
      },
    ],
  },
  {
    path: 'disables',
    children: [
      {
        path: 'disables',
        component: DisablesComponent,
        canActivate: [DisablesHandlerService],
      },
      {
        path: 'select',
        component: SelectDisablesComponent,
      },
    ],
  },
  {
    path: 'area-triggers',
    children: [
      {
        path: 'select',
        component: SelectAreaTriggerComponent,
      },
      {
        path: 'areatrigger-teleport',
        component: AreatriggerTeleportComponent,
        canActivate: [AreaTriggerHandlerService],
      },
      {
        path: 'areatrigger-tavern',
        component: AreatriggerTavernComponent,
        canActivate: [AreaTriggerHandlerService],
      },
      {
        path: 'areatrigger-involvedrelation',
        component: AreatriggerInvolvedrelationComponent,
        canActivate: [AreaTriggerHandlerService],
      },
      {
        path: 'areatrigger-scripts',
        component: AreatriggerScriptsComponent,
        canActivate: [AreaTriggerHandlerService],
      },
      {
        path: 'areatrigger',
        component: AreatriggerComponent,
        canActivate: [AreaTriggerHandlerService],
      },
    ],
  },
  {
    path: 'db-scripts',
    children: [
      {
        path: 'select-event-scripts',
        component: SelectEventScriptsComponent,
      },
      {
        path: 'event-scripts',
        component: EventScriptsComponent,
        canActivate: [EventScriptsHandlerService],
      },
      {
        path: 'select-spell-scripts',
        component: SelectSpellScriptsComponent,
      },
      {
        path: 'spell-scripts',
        component: SpellScriptsComponent,
        canActivate: [SpellScriptsHandlerService],
      },
    ],
  },
  {
    path: 'creature-immunities',
    children: [
      {
        path: 'select',
        component: SelectCreatureImmunitiesComponent,
      },
      {
        path: 'creature-immunities',
        component: CreatureImmunitiesComponent,
        canActivate: [CreatureImmunitiesHandlerService],
      },
    ],
  },
  {
    path: 'trainer',
    children: [
      {
        path: 'select',
        component: SelectTrainerComponent,
      },
      {
        path: 'copy',
        component: TrainerCopyComponent,
        canActivate: [TrainerHandlerService],
      },
      {
        path: 'trainer',
        component: TrainerComponent,
        canActivate: [TrainerHandlerService],
      },
      {
        path: 'trainer-spell',
        component: TrainerSpellComponent,
        canActivate: [TrainerHandlerService],
      },
    ],
  },
  {
    path: 'unused-guid-search',
    component: UnusedGuidSearchComponent,
  },
  {
    path: 'settings',
    component: SettingsComponent,
  },
  {
    path: 'world-editor',
    // kept alive in its tab while other parts of Keira are open (see KeepAliveRouteStrategy)
    data: { keepAlive: true },
    // Lazy: keeps Three.js and the game-data parsers out of the startup bundle.
    loadComponent: () => import('@keira/features/world-editor').then((m) => m.WorldEditorComponent),
    providers: [{ provide: WORLD_EDITOR_LINKS, useFactory: worldEditorLinks }],
  },
];

import { Routes } from '@angular/router';

import { DashboardComponent } from '@keira/features/dashboard';
import { SettingsComponent } from '@keira/features/settings';

import { ConditionsComponent, ConditionsHandlerService, SelectConditionsComponent } from '@keira/features/conditions';
import {
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
} from '@keira/features/creature';
import {
  GameobjectHandlerService,
  GameobjectLootTemplateComponent,
  GameobjectQuestitemComponent,
  GameobjectSpawnAddonComponent,
  GameobjectSpawnComponent,
  GameobjectTemplateAddonComponent,
  GameobjectTemplateComponent,
  SaiGameobjectComponent,
  SelectGameobjectComponent,
} from '@keira/features/gameobject';
import { GossipHandlerService, GossipMenuComponent, GossipMenuOptionComponent, SelectGossipComponent } from '@keira/features/gossip';
import {
  DisenchantLootTemplateComponent,
  ItemEnchantmentTemplateComponent,
  ItemHandlerService,
  ItemLootTemplateComponent,
  ItemTemplateComponent,
  MillingLootTemplateComponent,
  ProspectingLootTemplateComponent,
  SelectItemComponent,
} from '@keira/features/item';
import {
  FishingLootHandlerService,
  FishingLootTemplateComponent,
  MailLootHandlerService,
  MailLootTemplateComponent,
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
  QuestTemplateComponent,
  SelectQuestComponent,
} from '@keira/features/quest';
import { SaiFullEditorComponent, SaiSearchEntityComponent, SaiSearchExistingComponent } from '@keira/features/smart-scripts';
import { SelectSpellComponent, SpellDbcComponent } from '@keira/features/spell';
import { SqlEditorComponent } from '@keira/features/sql-editor';
import { SaiHandlerService } from '@keira/shared/sai-editor';
import {
  BroadcastTextComponent,
  BroadcastTextHandlerService,
  NpcTextComponent,
  NpcTextHandlerService,
  PageTextComponent,
  PageTextHandlerService,
  SelectBroadcastTextComponent,
  SelectNpcTextComponent,
  SelectPageTextComponent,
  AcoreStringComponent,
  AcoreStringHandlerService,
  AcoreStringLocaleComponent,
  SelectAcoreStringComponent,
} from '@keira/features/texts';
import { GameTeleComponent, GameTeleHandlerService, SelectGameTeleComponent } from '@keira/features/game-tele';
import {
  CreatureImmunitiesComponent,
  CreatureImmunitiesHandlerService,
  SelectCreatureImmunitiesComponent,
} from '@keira/features/creature-immunities';
import { SelectTrainerComponent, TrainerComponent, TrainerHandlerService, TrainerSpellComponent } from '@keira/features/trainer';
import {
  GameEventHandlerService,
  SelectGameEventComponent,
  GameEventComponent,
  GameEventCreatureComponent,
  GameEventCreatureRemovedComponent,
  GameEventRemovedPoolsComponent,
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
  GameEventArenaSeasonComponent,
  GameEventQuestConditionComponent,
  GameEventConditionComponent,
} from '@keira/features/game-events';
import { UnusedGuidSearchComponent } from '@keira/features/unused-guid-search';

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
    path: 'creature',
    children: [
      {
        path: 'select',
        component: SelectCreatureComponent,
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
        path: 'select',
        component: SelectGameobjectComponent,
      },
      {
        path: 'gameobject-template',
        component: GameobjectTemplateComponent,
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
        path: 'select',
        component: SelectItemComponent,
      },
      {
        path: 'item-template',
        component: ItemTemplateComponent,
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
        path: 'select-mail',
        component: SelectMailLootComponent,
      },
      {
        path: 'mail',
        component: MailLootTemplateComponent,
        canActivate: [MailLootHandlerService],
      },
    ],
  },
  {
    path: 'texts',
    children: [
      {
        path: 'select-page-text',
        component: SelectPageTextComponent,
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
        path: 'acore-string-locale',
        component: AcoreStringLocaleComponent,
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
        path: 'select',
        component: SelectGossipComponent,
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
        path: 'select',
        component: SelectSpellComponent,
      },
      {
        path: 'spell-dbc',
        component: SpellDbcComponent,
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
        path: 'game-event-pool-removed',
        component: GameEventRemovedPoolsComponent,
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
      {
        path: 'game-event-arena-season',
        component: GameEventArenaSeasonComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-quest-condition',
        component: GameEventQuestConditionComponent,
        canActivate: [GameEventHandlerService],
      },
      {
        path: 'game-event-condition',
        component: GameEventConditionComponent,
        canActivate: [GameEventHandlerService],
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
];

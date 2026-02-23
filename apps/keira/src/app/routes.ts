import { Routes } from '@angular/router';

import { DashboardComponent } from '@keira/features/dashboard';

import { ConditionsComponent, ConditionsHandlerService, SelectConditionsComponent } from '@keira/features/conditions';
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
} from '@keira/features/gameobject';
import {
  GossipHandlerService,
  GossipMenuComponent,
  GossipMenuOptionComponent,
  SelectGossipComponent,
  GossipCopyComponent,
} from '@keira/features/gossip';
import {
  DisenchantLootTemplateComponent,
  ItemEnchantmentTemplateComponent,
  ItemHandlerService,
  ItemCopyComponent,
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
  QuestHandlerService,
  QuestOfferRewardComponent,
  QuestRequestItemsComponent,
  QuestTemplateAddonComponent,
  QuestTemplateLocaleComponent,
  QuestTemplateComponent,
  SelectQuestComponent,
  QuestCopyComponent,
} from '@keira/features/quest';
import { SaiFullEditorComponent, SaiSearchEntityComponent, SaiSearchExistingComponent } from '@keira/features/smart-scripts';
import { SelectSpellComponent, SpellDbcComponent, SpellCopyComponent, SpellHandlerService } from '@keira/features/spell';
import { SqlEditorComponent } from '@keira/features/sql-editor';
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
} from 'texts';
import {
  SelectTrainerComponent,
  TrainerCopyComponent,
  TrainerComponent,
  TrainerHandlerService,
  TrainerSpellComponent,
} from '@keira/features/trainer';
import { GameTeleComponent, GameTeleHandlerService, SelectGameTeleComponent, GameTeleCopyComponent } from '@keira/features/game-tele';

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
];

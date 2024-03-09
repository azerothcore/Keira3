import { Routes } from '@angular/router';

import { DashboardComponent } from '@keira/features/dashboard';

import { SelectCreatureComponent } from './features/creature/select-creature/select-creature.component';
import { CreatureTemplateComponent } from './features/creature/creature-template/creature-template.component';
import { CreatureTemplateAddonComponent } from './features/creature/creature-template-addon/creature-template-addon.component';
import { CreatureTemplateResistanceComponent } from './features/creature/creature-template-resistance/creature-template-resistance.component';
import { CreatureTemplateSpellComponent } from './features/creature/creature-template-spell/creature-template-spell.component';
import { CreatureTemplateMovementComponent } from './features/creature/creature-template-movement/creature-template-movement.component';
import { NpcVendorComponent } from './features/creature/npc-vendor/npc-vendor.component';
import { CreatureEquipTemplateComponent } from './features/creature/creature-equip-template/creature-equip-template.component';
import { CreatureOnkillReputationComponent } from './features/creature/creature-onkill-reputation/creature-onkill-reputation.component';
import { CreatureHandlerService } from './features/creature/creature-handler.service';
import { CreatureQuestitemComponent } from './features/creature/creature-questitem/creature-questitem.component';
import { CreatureLootTemplateComponent } from './features/creature/creature-loot-template/creature-loot-template.component';
import { PickpocketingLootTemplateComponent } from './features/creature/pickpocketing-loot-template/pickpocketing-loot-template.component';
import { SkinningLootTemplateComponent } from './features/creature/skinning-loot-template/skinning-loot-template.component';
import { NpcTrainerComponent } from './features/creature/npc-trainer/npc-trainer.component';
import { CreatureSpawnComponent } from './features/creature/creature-spawn/creature-spawn.component';
import { CreatureSpawnAddonComponent } from './features/creature/creature-spawn-addon/creature-spawn-addon.component';
import { QuestTemplateComponent } from './features/quest/quest-template/quest-template.component';
import { QuestHandlerService } from './features/quest/quest-handler.service';
import { SelectQuestComponent } from './features/quest/select-quest/select-quest.component';
import { QuestTemplateAddonComponent } from './features/quest/quest-template-addon/quest-template-addon.component';
import { QuestOfferRewardComponent } from './features/quest/quest-offer-reward/quest-offer-reward.component';
import { QuestRequestItemsComponent } from './features/quest/quest-request-items/quest-request-items.component';
import { GameobjectTemplateComponent } from './features/gameobject/gameobject-template/gameobject-template.component';
import { GameobjectTemplateAddonComponent } from './features/gameobject/gameobject-template-addon/gameobject-template-addon.component';
import { GameobjectHandlerService } from './features/gameobject/gameobject-handler.service';
import { SelectGameobjectComponent } from './features/gameobject/select-gameobject/select-gameobject.component';
import { GameobjectQuestitemComponent } from './features/gameobject/gameobject-questitem/gameobject-questitem.component';
import { GameobjectSpawnComponent } from './features/gameobject/gameobject-spawn/gameobject-spawn.component';
import { CreatureQueststarterComponent } from './features/quest/creature-queststarter/creature-queststarter.component';
import { CreatureQuestenderComponent } from './features/quest/creature-questender/creature-questender.component';
import { GameobjectQueststarterComponent } from './features/quest/gameobject-queststarter/gameobject-queststarter.component';
import { GameobjectQuestenderComponent } from './features/quest/gameobject-questender/gameobject-questender.component';
import { GameobjectLootTemplateComponent } from './features/gameobject/gameobject-loot-template/gameobject-loot-template.component';
import { SelectItemComponent } from './features/item/select-item/select-item.component';
import { ItemTemplateComponent } from './features/item/item-template/item-template.component';
import { ItemHandlerService } from './features/item/item-handler.service';
import { ItemLootTemplateComponent } from './features/item/item-loot-template/item-loot-template.component';
import { DisenchantLootTemplateComponent } from './features/item/disenchant-loot-template/disenchant-loot-template.component';
import { ProspectingLootTemplateComponent } from './features/item/prospecting-loot-template/prospecting-loot-template.component';
import { MillingLootTemplateComponent } from './features/item/milling-loot-template/milling-loot-template.component';
import { ItemEnchantmentTemplateComponent } from './features/item/item-enchantment/item-enchantment-template.component';
import { SelectGossipComponent } from './features/gossip/select-gossip/select-gossip.component';
import { GossipHandlerService } from './features/gossip/gossip-handler.service';
import { GossipMenuComponent } from './features/gossip/gossip-menu/gossip-menu.component';
import { GossipMenuOptionComponent } from './features/gossip/gossip-menu-option/gossip-menu-option.component';
import { SelectConditionsComponent } from './features/conditions/select-conditions/select-conditions.component';
import { ConditionsHandlerService } from './features/conditions/conditions-handler.service';
import { SaiSearchExistingComponent } from './features/smart-scripts/sai-search-existing/sai-search-existing.component';
import { SaiSearchEntityComponent } from './features/smart-scripts/sai-search-entity/sai-search-entity.component';
import { SaiCreatureComponent } from './features/creature/sai-creature/sai-creature.component';
import { SaiFullEditorComponent } from './features/smart-scripts/sai-full-editor/sai-full-editor.component';
import { SaiGameobjectComponent } from './features/gameobject/sai-gameobject/sai-gameobject.component';
import { ConditionsComponent } from './features/conditions/edit-conditions/conditions.component';
import { SqlEditorComponent } from './features/sql-editor/sql-editor.component';
import { SelectReferenceLootComponent } from './features/other-loots/reference-loot/select-reference-loot.component';
import { ReferenceLootTemplateComponent } from './features/other-loots/reference-loot/reference-loot-template.component';
import { ReferenceLootHandlerService } from './features/other-loots/reference-loot/reference-loot-handler.service';
import { SpellLootTemplateComponent } from './features/other-loots/spell-loot/spell-loot-template.component';
import { SpellLootHandlerService } from './features/other-loots/spell-loot/spell-loot-handler.service';
import { SelectSpellLootComponent } from './features/other-loots/spell-loot/select-spell-loot.component';
import { SelectFishingLootComponent } from './features/other-loots/fishing-loot/select-fishing-loot.component';
import { FishingLootTemplateComponent } from './features/other-loots/fishing-loot/fishing-loot-template.component';
import { FishingLootHandlerService } from './features/other-loots/fishing-loot/fishing-loot-handler.service';
import { SelectMailLootComponent } from './features/other-loots/mail-loot/select-mail-loot.component';
import { MailLootTemplateComponent } from './features/other-loots/mail-loot/mail-loot-template.component';
import { MailLootHandlerService } from './features/other-loots/mail-loot/mail-loot-handler.service';
import { SelectSpellComponent } from './features/spell/select-spell/select-spell.component';
import { SpellDbcComponent } from './features/spell/spell-dbc/spell-dbc.component';
import { GameobjectSpawnAddonComponent } from './features/gameobject/gameobject-spawn-addon/gameobject-spawn-addon.component';
import { SaiHandlerService } from '@keira/shared/core';

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
        path: 'npc-trainer',
        component: NpcTrainerComponent,
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
];

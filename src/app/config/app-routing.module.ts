import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from '../components/editors/dashboard/dashboard.component';

import { SelectCreatureComponent } from '../components/editors/creature/select-creature/select-creature.component';
import { CreatureTemplateComponent } from '../components/editors/creature/creature-template/creature-template.component';
import { CreatureTemplateAddonComponent } from '../components/editors/creature/creature-template-addon/creature-template-addon.component';
import { NpcVendorComponent } from '../components/editors/creature/npc-vendor/npc-vendor.component';
import { CreatureEquipTemplateComponent } from '../components/editors/creature/creature-equip-template/creature-equip-template.component';
import {
  CreatureOnkillReputationComponent
} from '../components/editors/creature/creature-onkill-reputation/creature-onkill-reputation.component';
import { CreatureHandlerService } from '../services/handlers/creature-handler.service';
import { CreatureQuestitemComponent } from '../components/editors/creature/creature-questitem/creature-questitem.component';
import { CreatureLootTemplateComponent } from '../components/editors/creature/creature-loot-template/creature-loot-template.component';
import {
  PickpocketingLootTemplateComponent
} from '../components/editors/creature/pickpocketing-loot-template/pickpocketing-loot-template.component';
import { SkinningLootTemplateComponent } from '../components/editors/creature/skinning-loot-template/skinning-loot-template.component';
import { NpcTrainerComponent } from '../components/editors/creature/npc-trainer/npc-trainer.component';
import { CreatureSpawnComponent } from '../components/editors/creature/creature-spawn/creature-spawn.component';
import { CreatureSpawnAddonComponent } from '../components/editors/creature/creature-spawn-addon/creature-spawn-addon.component';
import { ComingSoonComponent } from '../components/editors/coming-soon/coming-soon.component';
import { QuestTemplateComponent } from '../components/editors/quest/quest-template/quest-template.component';
import { QuestHandlerService } from '../services/handlers/quest-handler.service';
import { SelectQuestComponent } from '../components/editors/quest/select-quest/select-quest.component';
import { QuestTemplateAddonComponent } from '../components/editors/quest/quest-template-addon/quest-template-addon.component';
import { QuestOfferRewardComponent } from '../components/editors/quest/quest-offer-reward/quest-offer-reward.component';
import { QuestRequestItemsComponent } from '../components/editors/quest/quest-request-items/quest-request-items.component';
import { GameobjectTemplateComponent } from '../components/editors/gameobject/gameobject-template/gameobject-template.component';
import {
  GameobjectTemplateAddonComponent
} from '../components/editors/gameobject/gameobject-template-addon/gameobject-template-addon.component';
import { GameobjectHandlerService } from '../services/handlers/gameobject-handler.service';
import { SelectGameobjectComponent } from '../components/editors/gameobject/select-gameobject/select-gameobject.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'coming-soon',
    component: ComingSoonComponent
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
    ]
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
    ]
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
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }

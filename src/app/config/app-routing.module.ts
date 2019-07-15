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
import { SpawnsComponent } from '../components/editors/creature/spawns/spawns.component';
import { SpawnsAddonComponent } from '../components/editors/creature/spawns-addon/spawns-addon.component';
import { ComingSoonComponent } from '../components/editors/coming-soon/coming-soon.component';

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
        path: 'spawns',
        component: SpawnsComponent,
        canActivate: [CreatureHandlerService],
      },
      {
        path: 'spawns-addon',
        component: SpawnsAddonComponent,
        canActivate: [CreatureHandlerService],
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
